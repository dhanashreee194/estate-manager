import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { FinanceModule } from '../finance/finance.module';
import { LandController } from './land.controller';
import { LandService } from './land.service';

@Module({
  imports: [PrismaModule, FinanceModule],
  controllers: [LandController],
  providers: [LandService],
  exports: [LandService],
})
export class LandModule {}
