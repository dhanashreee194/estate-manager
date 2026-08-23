import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CashbookCategory, CashbookEntryType } from '@prisma/client';
import { FinanceService } from './finance.service';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { UpdateBankAccountDto } from './dto/update-bank-account.dto';
import { CreateCashbookEntryDto } from './dto/create-cashbook-entry.dto';
import { TransferDto } from './dto/transfer.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  // ── Accounts ──

  @Post('accounts')
  createAccount(@Body() dto: CreateBankAccountDto, @Req() req) {
    return this.financeService.createAccount(dto, req.user.companyId);
  }

  @Get('accounts')
  listAccounts(@Req() req, @Query('all') all?: string) {
    return this.financeService.findAccounts(req.user.companyId, all === '1');
  }

  @Get('summary')
  summary(@Req() req) {
    return this.financeService.getSummary(req.user.companyId);
  }

  @Get('accounts/:id')
  getAccount(@Param('id') id: string, @Req() req) {
    return this.financeService.findAccount(id, req.user.companyId);
  }

  @Patch('accounts/:id')
  updateAccount(
    @Param('id') id: string,
    @Body() dto: UpdateBankAccountDto,
    @Req() req,
  ) {
    return this.financeService.updateAccount(id, dto, req.user.companyId);
  }

  @Delete('accounts/:id')
  deactivateAccount(@Param('id') id: string, @Req() req) {
    return this.financeService.deactivateAccount(id, req.user.companyId);
  }

  // ── Cashbook ──

  @Get('cashbook')
  cashbook(
    @Req() req,
    @Query('bankAccountId') bankAccountId?: string,
    @Query('projectId') projectId?: string,
    @Query('type') type?: CashbookEntryType,
    @Query('category') category?: CashbookCategory,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.financeService.getCashbook(req.user.companyId, {
      bankAccountId,
      projectId,
      type,
      category,
      from,
      to,
    });
  }

  @Post('cashbook')
  createEntry(@Body() dto: CreateCashbookEntryDto, @Req() req) {
    return this.financeService.createEntry(dto, req.user.companyId);
  }

  @Post('transfer')
  transfer(@Body() dto: TransferDto, @Req() req) {
    return this.financeService.transfer(dto, req.user.companyId);
  }
}
