import { Module } from '@nestjs/common';
import { InstallmentsService } from './installments.service';
import { InstallmentsController } from './installments.controller';

@Module({
  providers: [InstallmentsService],
  controllers: [InstallmentsController]
})
export class InstallmentsModule {}
