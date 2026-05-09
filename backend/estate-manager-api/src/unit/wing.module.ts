import { Module } from '@nestjs/common';
import { WingService } from './wing.service';
import { WingController } from './wing.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule], // add if PrismaModule is not @Global()
  controllers: [WingController],
  providers: [WingService],
})
export class WingModule {}
