import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LedgerService } from './ledger.service';
import { Roles } from 'src/auth/roles.decorator';

@UseGuards(AuthGuard('jwt'))
@Roles('ADMIN', 'ACCOUNTANT')
@Controller('ledger')
export class LedgerController {
  constructor(private readonly ledgerService: LedgerService) {}

  // 1️⃣ Company-wide ledger
  @Get('revenue')
  getCompanyRevenue(
    @Req() req,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.ledgerService.getCompanyRevenue(req.user.companyId, from, to);
  }

  // 2️⃣ Revenue summary
  @Get('revenue/summary')
  getSummary(@Req() req) {
    return this.ledgerService.getRevenueSummary(req.user.companyId);
  }

  // 3️⃣ Project-wise revenue
  @Get('revenue/project/:projectId')
  getProjectRevenue(@Param('projectId') projectId: string, @Req() req) {
    return this.ledgerService.getProjectRevenue(projectId, req.user.companyId);
  }
}
