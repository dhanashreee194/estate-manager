import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import type { Response } from 'express';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('booking')
export class BookingController {
  constructor(
    private readonly bookingService: BookingService, // ✅ correct name
  ) {}

  @Post()
  @Roles('ADMIN', 'SALES')
  create(@Body() dto: CreateBookingDto, @Req() req) {
    console.log('USER =>', req.user);
    return this.bookingService.createBooking(dto, {
      id: req.user.userId, // ✅ CORRECT
      companyId: req.user.companyId,
    });
  }

  @Get('project/:projectId')
  @Roles('ADMIN', 'SALES', 'ACCOUNTANT')
  getProjectBookings(@Param('projectId') id: string, @Req() req) {
    return this.bookingService.getProjectBookings(id, req.user.companyId);
  }

  @Get(':id/agreement')
  @Roles('ADMIN', 'SALES', 'ACCOUNTANT')
  getAgreement(
    @Param('id') id: string,
    @Req() req,
    @Res() res: Response,
    @Query('lang') lang?: string,
  ) {
    return this.bookingService.generateAllotmentLetter(
      id,
      req.user.companyId,
      res,
      lang,
    );
  }

  @Post(':id/cancel')
  @Roles('ADMIN')
  cancel(@Param('id') id: string, @Req() req) {
    return this.bookingService.cancelBooking(id, req.user.companyId);
  }

  @Put(':id')
  @Roles('ADMIN', 'SALES')
  update(@Param('id') id: string, @Body() dto: CreateBookingDto, @Req() req) {
    return this.bookingService.updateBooking(id, dto, req.user.companyId);
  }

  @Get(':id/installments')
  getInstallments(@Param('id') id: string) {
    return this.bookingService.getBookingInstallments(id);
  }
}
