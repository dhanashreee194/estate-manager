import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DashboardService } from './dashboard.service';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('ADMIN', 'ACCOUNTANT')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  // Company-wide dashboard
  @Get()
  getDashboard(@Req() req) {
    return this.dashboardService.getCompanyDashboard(req.user.companyId);
  }
  // Project-wise profit
  @Get('project/:projectId')
  getProjectProfit(@Param('projectId') projectId: string, @Req() req) {
    return this.dashboardService.getProjectProfit(
      projectId,
      req.user.companyId,
    );
  }

  // Cash flow
  @Get('cashflow')
  getCashFlow(@Req() req) {
    return this.dashboardService.getCashFlow(req.user.companyId);
  }
}
