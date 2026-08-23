import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InstallmentsService } from './installments.service';
import type { Response } from 'express';

@UseGuards(AuthGuard('jwt'))
@Controller('installments')
export class InstallmentsController {
  constructor(private readonly installmentsService: InstallmentsService) {}

  // Static routes first (before :id)
  @Get()
  list(
    @Req() req: any,
    @Query('status') status?: string,
    @Query('projectId') projectId?: string,
    @Query('overdueOnly') overdueOnly?: string,
  ) {
    return this.installmentsService.list(req.user.companyId, {
      status,
      projectId,
      overdueOnly: overdueOnly === '1' || overdueOnly === 'true',
    });
  }

  @Get('dashboard')
  dashboard(@Req() req: any) {
    return this.installmentsService.dashboard(req.user.companyId);
  }

  @Post('refresh-status')
  refreshStatuses(@Req() req: any) {
    return this.installmentsService.refreshStatuses(req.user.companyId);
  }

  @Get('booking/:bookingId')
  getBookingInstallments(
    @Param('bookingId') bookingId: string,
    @Req() req: any,
  ) {
    return this.installmentsService.getBookingInstallments(
      bookingId,
      req.user.companyId,
    );
  }

  @Get(':id/demand-letter')
  getDemandLetter(
    @Param('id') id: string,
    @Req() req: any,
    @Res() res: Response,
    @Query('lang') lang?: string,
  ) {
    return this.installmentsService.generateDemandLetter(
      id,
      req.user.companyId,
      res,
      lang,
    );
  }

  @Post(':id/pay')
  payInstallment(
    @Param('id') id: string,
    @Body() body: { amount: number },
    @Req() req: any,
  ) {
    return this.installmentsService.payInstallment(
      id,
      body.amount,
      req.user.companyId,
    );
  }

  @Patch(':id/reschedule')
  reschedule(
    @Param('id') id: string,
    @Body() body: { dueDate: string },
    @Req() req: any,
  ) {
    return this.installmentsService.reschedule(
      id,
      new Date(body.dueDate),
      req.user.companyId,
    );
  }
}
