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
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Roles } from 'src/auth/roles.decorator';

@UseGuards(AuthGuard('jwt'))
@Roles('ADMIN', 'SALES', 'ACCOUNTANT')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  // Add payment
  @Post()
  @Roles('ADMIN', 'ACCOUNTANT')
  create(@Body() dto: CreatePaymentDto, @Req() req) {
    return this.paymentService.addPayment(dto, {
      companyId: req.user.companyId,
    });
  }

  // Booking ledger (installments + payments + balance)
  @Get('booking/:id/ledger')
  getBookingLedger(@Param('id') id: string, @Req() req) {
    return this.paymentService.getBookingLedger(id, req.user.companyId);
  }

  // Get payments for booking
  @Get('booking/:id')
  getBookingPayments(@Param('id') id: string, @Req() req) {
    return this.paymentService.getBookingPayments(id, req.user.companyId);
  }

  // Revenue summary for project
  @Get('project/:projectId/revenue')
  getRevenue(@Param('projectId') projectId: string, @Req() req) {
    return this.paymentService.getProjectRevenue(projectId, req.user.companyId);
  }
}
