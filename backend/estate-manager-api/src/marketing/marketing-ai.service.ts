import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { AiGenerateDto } from './dto/ai-generate.dto';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { randomBytes } from 'crypto';

type CaptionResult = {
  title: string;
  headline: string;
  body: string;
  ctaLabel: string;
  imagePrompt: string;
};

@Injectable()
export class MarketingAiService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  private requireApiKey() {
    const key = this.config.get<string>('OPENAI_API_KEY');
    if (!key) {
      throw new ServiceUnavailableException(
        'AI is not configured. Set OPENAI_API_KEY on the API server.',
      );
    }
    return key;
  }

  private model() {
    return this.config.get<string>('OPENAI_MODEL') || 'gpt-4o-mini';
  }

  private imageModel() {
    return this.config.get<string>('OPENAI_IMAGE_MODEL') || 'dall-e-3';
  }

  private async context(dto: AiGenerateDto, companyId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: dto.projectId, companyId },
    });
    if (!project) throw new BadRequestException('Project not found');

    let unit: {
      unitNumber: string;
      unitType: string;
      bhkType: string | null;
      areaSqFt: number;
      basePrice: number;
      floor: number | null;
      direction: string | null;
    } | null = null;

    if (dto.unitId) {
      unit = await this.prisma.unit.findFirst({
        where: { id: dto.unitId, projectId: dto.projectId, companyId },
        select: {
          unitNumber: true,
          unitType: true,
          bhkType: true,
          areaSqFt: true,
          basePrice: true,
          floor: true,
          direction: true,
        },
      });
      if (!unit) throw new BadRequestException('Unit not found for project');
    }

    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      select: { name: true },
    });

    return { project, unit, companyName: company?.name || 'Estate developer' };
  }

  private buildBrief(dto: AiGenerateDto, ctx: Awaited<ReturnType<MarketingAiService['context']>>) {
    const unitLine = ctx.unit
      ? [
          `Unit: ${ctx.unit.unitType} ${ctx.unit.unitNumber}`,
          ctx.unit.bhkType ? `BHK: ${ctx.unit.bhkType}` : null,
          `Area: ${ctx.unit.areaSqFt} sqft`,
          `Price: ₹${Number(ctx.unit.basePrice).toLocaleString('en-IN')}`,
          ctx.unit.floor != null ? `Floor: ${ctx.unit.floor}` : null,
          ctx.unit.direction ? `Facing: ${ctx.unit.direction}` : null,
        ]
          .filter(Boolean)
          .join(', ')
      : 'Promote the whole project (not a single unit).';

    return [
      `Company: ${ctx.companyName}`,
      `Project: ${ctx.project.name}`,
      ctx.project.location ? `Location: ${ctx.project.location}` : null,
      unitLine,
      `Language preference: ${dto.language || 'English (India)'}. Marathi phrases OK if language is Marathi.`,
      `User comments / instructions for AI:\n${dto.comments}`,
      dto.headline ? `Existing headline (refine if useful): ${dto.headline}` : null,
      dto.body ? `Existing body (refine if useful): ${dto.body}` : null,
    ]
      .filter(Boolean)
      .join('\n');
  }

  async generateCaption(dto: AiGenerateDto, companyId: string): Promise<CaptionResult> {
    const apiKey = this.requireApiKey();
    const ctx = await this.context(dto, companyId);
    const brief = this.buildBrief(dto, ctx);

    const system = `You are a real-estate marketing copywriter for Indian housing projects.
Return ONLY valid JSON with keys: title, headline, body, ctaLabel, imagePrompt.
- title: short internal campaign name
- headline: punchy social headline (<= 90 chars)
- body: WhatsApp/Facebook/Instagram caption (2-5 short lines, include project/unit highlights, soft CTA, no fake discounts)
- ctaLabel: short button text (e.g. Enquire now / Book site visit)
- imagePrompt: detailed English prompt for an attractive real-estate marketing image (no text overlays, photorealistic or polished lifestyle render)`;

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model(),
        temperature: 0.8,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: brief },
        ],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new BadRequestException(
        `AI caption failed (${res.status}): ${errText.slice(0, 300)}`,
      );
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const raw = data.choices?.[0]?.message?.content || '{}';
    let parsed: Partial<CaptionResult>;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new BadRequestException('AI returned invalid JSON for caption');
    }

    return {
      title: String(parsed.title || `${ctx.project.name} campaign`).slice(0, 120),
      headline: String(parsed.headline || '').slice(0, 140),
      body: String(parsed.body || ''),
      ctaLabel: String(parsed.ctaLabel || 'Enquire now').slice(0, 60),
      imagePrompt: String(parsed.imagePrompt || ''),
    };
  }

  async generateImage(dto: AiGenerateDto, companyId: string) {
    const apiKey = this.requireApiKey();
    const ctx = await this.context(dto, companyId);

    const imagePrompt = [
      `Photorealistic real-estate marketing image for ${ctx.project.name}`,
      ctx.project.location ? `located in ${ctx.project.location}` : null,
      ctx.unit
        ? `featuring ${ctx.unit.unitType} ${ctx.unit.unitNumber}${
            ctx.unit.bhkType ? `, ${ctx.unit.bhkType}` : ''
          }`
        : 'project exterior / lifestyle overview',
      `Creative direction from marketer: ${dto.comments}`,
      dto.headline ? `Campaign mood from headline: ${dto.headline}` : null,
      'Professional architecture photography or polished CGI, natural light, inviting atmosphere, no text, no logos, no watermarks, no people faces if possible',
    ]
      .filter(Boolean)
      .join('. ');

    const res = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.imageModel(),
        prompt: imagePrompt.slice(0, 3500),
        n: 1,
        size: '1024x1024',
        response_format: 'b64_json',
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new BadRequestException(
        `AI image failed (${res.status}): ${errText.slice(0, 300)}`,
      );
    }

    const data = (await res.json()) as {
      data?: { b64_json?: string; url?: string }[];
    };
    const item = data.data?.[0];
    if (!item) throw new BadRequestException('AI image returned empty result');

    if (item.url) {
      return { imageUrl: item.url, imagePrompt };
    }

    const uploadsDir = join(process.cwd(), 'uploads', 'campaigns');
    if (!existsSync(uploadsDir)) {
      mkdirSync(uploadsDir, { recursive: true });
    }
    const filename = `ai-${randomBytes(8).toString('hex')}.png`;
    const filepath = join(uploadsDir, filename);
    writeFileSync(filepath, Buffer.from(item.b64_json!, 'base64'));

    return {
      imageUrl: `/uploads/campaigns/${filename}`,
      imagePrompt,
    };
  }
}
