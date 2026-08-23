import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CampaignShareChannel,
  CampaignStatus,
  LeadSource,
} from '@prisma/client';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { PublicLeadDto } from './dto/public-lead.dto';

@Injectable()
export class MarketingService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  private appPublicUrl() {
    return (
      this.config.get<string>('PUBLIC_APP_URL') ||
      'http://localhost:5173'
    ).replace(/\/$/, '');
  }

  private makeCode() {
    return randomBytes(5).toString('hex'); // 10 hex chars
  }

  private include = {
    project: { select: { id: true, name: true, location: true } },
    unit: {
      select: {
        id: true,
        unitNumber: true,
        unitType: true,
        bhkType: true,
        areaSqFt: true,
        basePrice: true,
        status: true,
        floor: true,
      },
    },
    createdBy: { select: { id: true, name: true } },
  };

  private async assertProject(projectId: string, companyId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, companyId },
    });
    if (!project) throw new BadRequestException('Project not found');
    return project;
  }

  private async assertUnit(
    unitId: string | undefined,
    projectId: string,
    companyId: string,
  ) {
    if (!unitId) return null;
    const unit = await this.prisma.unit.findFirst({
      where: { id: unitId, projectId, companyId },
    });
    if (!unit) throw new BadRequestException('Unit not found for project');
    return unit;
  }

  async create(
    dto: CreateCampaignDto,
    companyId: string,
    userId?: string,
  ) {
    await this.assertProject(dto.projectId, companyId);
    await this.assertUnit(dto.unitId, dto.projectId, companyId);

    let code = this.makeCode();
    for (let i = 0; i < 5; i++) {
      const exists = await this.prisma.marketingCampaign.findUnique({
        where: { code },
      });
      if (!exists) break;
      code = this.makeCode();
    }

    return this.prisma.marketingCampaign.create({
      data: {
        companyId,
        code,
        title: dto.title,
        projectId: dto.projectId,
        unitId: dto.unitId,
        headline: dto.headline,
        body: dto.body,
        ctaLabel: dto.ctaLabel || 'Enquire now',
        ctaPhone: dto.ctaPhone,
        imageUrl: dto.imageUrl,
        enableWhatsapp: dto.enableWhatsapp ?? true,
        enableFacebook: dto.enableFacebook ?? true,
        enableInstagram: dto.enableInstagram ?? true,
        status: dto.status || CampaignStatus.DRAFT,
        createdById: userId,
      },
      include: this.include,
    });
  }

  async findAll(companyId: string, status?: CampaignStatus) {
    return this.prisma.marketingCampaign.findMany({
      where: {
        companyId,
        ...(status ? { status } : {}),
      },
      orderBy: { updatedAt: 'desc' },
      include: this.include,
    });
  }

  async findOne(id: string, companyId: string) {
    const campaign = await this.prisma.marketingCampaign.findFirst({
      where: { id, companyId },
      include: {
        ...this.include,
        shares: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });
    if (!campaign) throw new NotFoundException('Campaign not found');
    return campaign;
  }

  async update(id: string, dto: UpdateCampaignDto, companyId: string) {
    const existing = await this.findOne(id, companyId);
    const projectId = dto.projectId || existing.projectId;
    if (dto.projectId) await this.assertProject(dto.projectId, companyId);
    if (dto.unitId !== undefined) {
      await this.assertUnit(dto.unitId || undefined, projectId, companyId);
    }

    return this.prisma.marketingCampaign.update({
      where: { id },
      data: {
        title: dto.title,
        projectId: dto.projectId,
        unitId: dto.unitId === null || dto.unitId === '' ? null : dto.unitId,
        headline: dto.headline,
        body: dto.body,
        ctaLabel: dto.ctaLabel,
        ctaPhone: dto.ctaPhone,
        imageUrl: dto.imageUrl,
        enableWhatsapp: dto.enableWhatsapp,
        enableFacebook: dto.enableFacebook,
        enableInstagram: dto.enableInstagram,
        status: dto.status,
      },
      include: this.include,
    });
  }

  async setStatus(id: string, status: CampaignStatus, companyId: string) {
    await this.findOne(id, companyId);
    return this.prisma.marketingCampaign.update({
      where: { id },
      data: { status },
      include: this.include,
    });
  }

  buildCompose(campaign: {
    code: string;
    title: string;
    headline: string;
    body: string;
    ctaLabel: string;
    ctaPhone: string | null;
    enableWhatsapp: boolean;
    enableFacebook: boolean;
    enableInstagram: boolean;
    project: { name: string; location: string | null };
    unit: {
      unitNumber: string;
      unitType: string;
      bhkType: string | null;
      areaSqFt: number;
      basePrice: number;
    } | null;
  }) {
    const baseLanding = `${this.appPublicUrl()}/c/${campaign.code}`;
    const unitLine = campaign.unit
      ? `${campaign.unit.unitType} ${campaign.unit.unitNumber}${
          campaign.unit.bhkType ? ` · ${campaign.unit.bhkType}` : ''
        } · ${campaign.unit.areaSqFt} sqft · ₹${Number(
          campaign.unit.basePrice,
        ).toLocaleString('en-IN')}`
      : null;

    const captionParts = [
      campaign.headline,
      campaign.body,
      `Project: ${campaign.project.name}${
        campaign.project.location ? ` (${campaign.project.location})` : ''
      }`,
      unitLine,
      `${campaign.ctaLabel}: ${baseLanding}`,
    ].filter(Boolean);

    const caption = captionParts.join('\n\n');

    const phoneDigits = (campaign.ctaPhone || '').replace(/\D/g, '');
    const waBase = phoneDigits
      ? `https://wa.me/${phoneDigits}`
      : 'https://wa.me/';

    return {
      caption,
      landingUrl: baseLanding,
      links: {
        whatsapp: campaign.enableWhatsapp
          ? {
              url: `${waBase}?text=${encodeURIComponent(caption)}`,
              landingUrl: `${baseLanding}?src=whatsapp`,
            }
          : null,
        facebook: campaign.enableFacebook
          ? {
              url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                `${baseLanding}?src=facebook`,
              )}`,
              landingUrl: `${baseLanding}?src=facebook`,
            }
          : null,
        instagram: campaign.enableInstagram
          ? {
              caption,
              landingUrl: `${baseLanding}?src=instagram`,
              copyText: caption,
            }
          : null,
      },
    };
  }

  async compose(id: string, companyId: string) {
    const campaign = await this.findOne(id, companyId);
    return {
      campaign,
      ...this.buildCompose(campaign),
    };
  }

  async recordShare(
    id: string,
    channel: CampaignShareChannel,
    companyId: string,
  ) {
    await this.findOne(id, companyId);
    await this.prisma.campaignShareEvent.create({
      data: { campaignId: id, channel },
    });
    return this.prisma.marketingCampaign.update({
      where: { id },
      data: { shareCount: { increment: 1 } },
      include: this.include,
    });
  }

  async getPublicByCode(code: string) {
    const campaign = await this.prisma.marketingCampaign.findFirst({
      where: { code, status: CampaignStatus.ACTIVE },
      include: {
        project: { select: { id: true, name: true, location: true } },
        unit: {
          select: {
            id: true,
            unitNumber: true,
            unitType: true,
            bhkType: true,
            areaSqFt: true,
            basePrice: true,
            floor: true,
            status: true,
          },
        },
        company: { select: { id: true, name: true } },
      },
    });
    if (!campaign) throw new NotFoundException('Campaign not found');

    await this.prisma.marketingCampaign.update({
      where: { id: campaign.id },
      data: { landingViewCount: { increment: 1 } },
    });

    return {
      code: campaign.code,
      title: campaign.title,
      headline: campaign.headline,
      body: campaign.body,
      ctaLabel: campaign.ctaLabel,
      ctaPhone: campaign.ctaPhone,
      imageUrl: campaign.imageUrl,
      project: campaign.project,
      unit: campaign.unit,
      companyName: campaign.company.name,
    };
  }

  async createPublicLead(code: string, dto: PublicLeadDto) {
    const campaign = await this.prisma.marketingCampaign.findFirst({
      where: { code, status: CampaignStatus.ACTIVE },
    });
    if (!campaign) throw new NotFoundException('Campaign not found');

    const allowed: LeadSource[] = [
      LeadSource.FACEBOOK,
      LeadSource.INSTAGRAM,
      LeadSource.WHATSAPP,
      LeadSource.WEBSITE,
      LeadSource.OTHER,
    ];
    const source =
      dto.source && allowed.includes(dto.source)
        ? dto.source
        : LeadSource.WEBSITE;

    const lead = await this.prisma.lead.create({
      data: {
        companyId: campaign.companyId,
        projectId: campaign.projectId,
        unitId: campaign.unitId,
        campaignId: campaign.id,
        name: dto.name,
        phone: dto.phone,
        email: dto.email,
        source,
        sourceDetail: campaign.title,
        remarks: dto.message,
        requirement: dto.message,
        status: 'NEW',
      },
    });

    await this.prisma.marketingCampaign.update({
      where: { id: campaign.id },
      data: { leadCount: { increment: 1 } },
    });

    return { ok: true, id: lead.id };
  }
}
