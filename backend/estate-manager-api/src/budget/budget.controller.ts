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
import { RolesGuard } from 'src/auth/roles.guard';
import { BudgetService } from './budget.service';
import { Roles } from 'src/auth/roles.decorator';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('ADMIN', 'ACCOUNTANT', 'SUPERVISOR')
@Controller('budget')
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  @Post('project/:projectId')
  setBudget(
    @Param('projectId') projectId: string,
    @Body('amount') amount: number,
    @Req() req,
  ) {
    return this.budgetService.setProjectBudget(
      projectId,
      amount,
      req.user.companyId,
    );
  }

  @Get('project/:projectId')
  getBudget(@Param('projectId') projectId: string, @Req() req) {
    return this.budgetService.getProjectBudget(projectId, req.user.companyId);
  }
}
