import { Module } from '@nestjs/common';
import { CompanyReportsService } from './company-reports.service';
import { CompanyReportsController } from './company-reports.controller';

@Module({
  providers: [CompanyReportsService],
  controllers: [CompanyReportsController]
})
export class CompanyReportsModule {}
