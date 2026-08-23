import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CampaignStatus } from '@prisma/client';
import { MarketingService } from './marketing.service';
import { MarketingAiService } from './marketing-ai.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { ShareEventDto } from './dto/share-event.dto';
import { AiGenerateDto } from './dto/ai-generate.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('marketing/campaigns')
export class MarketingController {
  constructor(
    private readonly marketingService: MarketingService,
    private readonly marketingAiService: MarketingAiService,
  ) {}

  @Post('ai/caption')
  aiCaption(@Body() dto: AiGenerateDto, @Req() req) {
    return this.marketingAiService.generateCaption(dto, req.user.companyId);
  }

  @Post('ai/image')
  aiImage(@Body() dto: AiGenerateDto, @Req() req) {
    return this.marketingAiService.generateImage(dto, req.user.companyId);
  }

  @Post()
  create(@Body() dto: CreateCampaignDto, @Req() req) {
    return this.marketingService.create(
      dto,
      req.user.companyId,
      req.user.userId,
    );
  }

  @Get()
  findAll(@Req() req, @Query('status') status?: CampaignStatus) {
    return this.marketingService.findAll(req.user.companyId, status);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    return this.marketingService.findOne(id, req.user.companyId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCampaignDto,
    @Req() req,
  ) {
    return this.marketingService.update(id, dto, req.user.companyId);
  }

  @Post(':id/status')
  setStatus(
    @Param('id') id: string,
    @Body('status') status: CampaignStatus,
    @Req() req,
  ) {
    return this.marketingService.setStatus(id, status, req.user.companyId);
  }

  @Post(':id/compose')
  compose(@Param('id') id: string, @Req() req) {
    return this.marketingService.compose(id, req.user.companyId);
  }

  @Post(':id/share-events')
  shareEvent(
    @Param('id') id: string,
    @Body() dto: ShareEventDto,
    @Req() req,
  ) {
    return this.marketingService.recordShare(
      id,
      dto.channel,
      req.user.companyId,
    );
  }
}
