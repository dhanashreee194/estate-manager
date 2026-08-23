import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { LeadSource } from '@prisma/client';
import { MarketingService } from './marketing.service';
import { PublicLeadDto } from './dto/public-lead.dto';

@Controller('public/campaigns')
export class MarketingPublicController {
  constructor(private readonly marketingService: MarketingService) {}

  @Get(':code')
  getLanding(@Param('code') code: string) {
    return this.marketingService.getPublicByCode(code);
  }

  @Post(':code/leads')
  createLead(
    @Param('code') code: string,
    @Body() dto: PublicLeadDto,
    @Query('src') src?: string,
  ) {
    const map: Record<string, LeadSource> = {
      facebook: LeadSource.FACEBOOK,
      instagram: LeadSource.INSTAGRAM,
      whatsapp: LeadSource.WHATSAPP,
      website: LeadSource.WEBSITE,
    };
    if (!dto.source && src && map[src.toLowerCase()]) {
      dto.source = map[src.toLowerCase()];
    }
    return this.marketingService.createPublicLead(code, dto);
  }
}
