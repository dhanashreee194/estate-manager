import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/roles.guard';
import { CompanyReportsService } from './company-reports.service';
import { Roles } from 'src/auth/roles.decorator';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('ADMIN', 'SUPERVISOR', 'SALES', 'ACCOUNTANT')
@Controller('company-reports')
export class CompanyReportsController {
  constructor(private readonly service: CompanyReportsService) {}

  // 🌍 Company analytics
  @Get('analytics')
  getAnalytics(@Req() req) {
    return this.service.getCompanyAnalytics(req.user.companyId);
  }

  // 📊 Company timeline
  @Get('timeline')
  getTimeline(@Req() req) {
    return this.service.getCompanyTimeline(req.user.companyId);
  }
}
