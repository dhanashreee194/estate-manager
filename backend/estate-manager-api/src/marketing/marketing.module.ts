import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { MarketingController } from './marketing.controller';
import { MarketingPublicController } from './marketing-public.controller';
import { MarketingService } from './marketing.service';
import { MarketingAiService } from './marketing-ai.service';

@Module({
  imports: [PrismaModule],
  controllers: [MarketingController, MarketingPublicController],
  providers: [MarketingService, MarketingAiService],
  exports: [MarketingService, MarketingAiService],
})
export class MarketingModule {}
