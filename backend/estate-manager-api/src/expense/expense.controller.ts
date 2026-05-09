import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ExpenseService } from './expense.service';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('ADMIN', 'ACCOUNTANT', 'SALES')
@Controller('expense')
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  // 1️⃣ List expenses for project
  @Get('project/:projectId')
  getExpenses(@Param('projectId') projectId: string, @Req() req) {
    return this.expenseService.getProjectExpenses(
      projectId,
      req.user.companyId,
    );
  }

  // 2️⃣ Final project cost report
  @Get('project/:projectId/report')
  getReport(@Param('projectId') projectId: string, @Req() req) {
    return this.expenseService.getProjectCostReport(
      projectId,
      req.user.companyId,
    );
  }

  // 3️⃣ Project analytics
  @Get(':projectId/analytics')
  getAnalytics(@Param('projectId') id: string, @Req() req) {
    console.log(req.user);
    return this.expenseService.getProjectAnalytics(id, req.user.companyId);
  }

  @Post()
  createExpense(@Body() body, @Req() req) {
    return this.expenseService.createExpense(body, req.user.companyId);
  }
}
