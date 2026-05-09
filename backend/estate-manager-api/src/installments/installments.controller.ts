import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { InstallmentsService } from './installments.service';
import { Res } from '@nestjs/common';
import { Response } from 'express';

@Controller('installments')
export class InstallmentsController {
  constructor(private readonly installmentsService: InstallmentsService) {}

  @Get(':id/demand-letter')
  getDemandLetter(
    @Param('id') id: string,
    @Req() req: any,
    @Res() res: Response,
  ) {
    return this.installmentsService.generateDemandLetter(
      id,
      req.user.companyId,
      res,
    );
  }

  // 1️⃣ Get installments for booking
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

  // 2️⃣ Pay installment (partial/full)
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

  // 3️⃣ Reschedule due date
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

  // 4️⃣ Dashboard summary
  @Get('dashboard')
  dashboard(@Req() req: any) {
    return this.installmentsService.dashboard(req.user.companyId);
  }

  // 5️⃣ Refresh statuses manually
  @Post('refresh-status')
  refreshStatuses(@Req() req: any) {
    return this.installmentsService.refreshStatuses(req.user.companyId);
  }
}
