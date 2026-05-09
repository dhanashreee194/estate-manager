import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingService {
  constructor(private prisma: PrismaService) {}

  // 1️⃣ Create booking (DOUBLE-BOOKING SAFE)
  async createBooking(dto: CreateBookingDto, user: any) {
    console.log('SERVICE USER =>', user);
    return this.prisma.$transaction(async (tx) => {
      // 1. Customer
      let customer = await tx.customer.findFirst({
        where: {
          phone: dto.phone,
          companyId: user.companyId,
        },
      });

      if (!customer) {
        customer = await tx.customer.create({
          data: {
            name: dto.name,
            phone: dto.phone,
            email: dto.email,
            address: dto.address,
            companyId: user.companyId,
          },
        });
      }

      // 2. Calculations
      const builtUpValue = dto.builtUpSqft * dto.marketRate;

      // 3. Booking
      const booking = await tx.booking.create({
        data: {
          unitId: dto.unitId,
          projectId: dto.projectId,

          customerId: customer.id,
          companyId: user.companyId,
          createdById: user.id,

          // Builder
          builtUpSqft: dto.builtUpSqft,
          marketRate: dto.marketRate,
          builtUpValue,

          gstAmount: dto.gstAmount,
          maintenanceFee: dto.maintenanceFee,
          advocateFee: dto.advocateFee,
          mecbFee: dto.mecbFee,
          oneTimeMaint: dto.oneTimeMaint,

          // Govt
          govtSqMeter: dto.govtSqMeter,
          govtValue: dto.govtValue,
          stampDuty: dto.stampDuty,
          registrationFee: dto.registrationFee,

          totalPrice: dto.totalPrice,
          govtAmount: dto.govtAmount,
          cashAmount: dto.cashAmount,
        },
      });

      // 4. Mark Unit Sold
      await tx.unit.update({
        where: { id: dto.unitId },
        data: { status: 'SOLD' },
      });

      const stages = [
        { name: 'Booking', percent: 30 },
        { name: 'Plinth', percent: 20 },
        { name: 'Slab', percent: 20 },
        { name: 'Possession', percent: 30 },
      ];

      for (const stage of stages) {
        await tx.installmentPlan.create({
          data: {
            bookingId: booking.id,
            milestone: stage.name,
            amount: (booking.totalPrice * stage.percent) / 100,
            dueDate: new Date(),
          },
        });
      }

      return booking;
    });
  }

  // 2️⃣ Get bookings for a project (COMPANY SAFE)
  getProjectBookings(projectId: string, companyId: string) {
    return this.prisma.booking.findMany({
      where: {
        projectId,
        project: {
          companyId,
        },
      },
      include: {
        unit: true,
        customer: true,
        payments: true,
      },
      orderBy: {
        bookingDate: 'desc',
      },
    });
  }

  // 3️⃣ Cancel booking (OPTIONAL but important)
  async cancelBooking(bookingId: string, companyId: string) {
    const booking = await this.prisma.booking.findFirst({
      where: {
        id: bookingId,
        project: {
          companyId,
        },
      },
      include: {
        unit: true,
      },
    });

    if (!booking) {
      throw new BadRequestException('Booking not found');
    }

    if (booking.status !== 'BOOKED') {
      throw new BadRequestException('Cannot cancel booking');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id: booking.id },
        data: { status: 'CANCELLED' },
      });

      await tx.unit.update({
        where: { id: booking.unitId },
        data: { status: 'AVAILABLE' },
      });

      return { message: 'Booking cancelled' };
    });
  }

  async getBookingBalance(bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { payments: true },
    });

    if (!booking) {
      throw new BadRequestException('Booking not found');
    }
    const paid = booking.payments.reduce((s, p) => s + p.amount, 0);

    return {
      total: booking.totalPrice,
      paid,
      balance: booking.totalPrice - paid,
    };
  }

  async updateBooking(id: string, dto: CreateBookingDto, companyId: string) {
    const booking = await this.prisma.booking.findFirst({
      where: {
        id,
        project: { companyId },
      },
      include: {
        unit: true,
      },
    });

    if (!booking) {
      throw new BadRequestException('Booking not found');
    }

    const builtUpValue = dto.builtUpSqft * dto.marketRate;

    return this.prisma.$transaction(async (tx) => {
      // ✅ Reactivate if cancelled
      const newStatus =
        booking.status === 'CANCELLED' ? 'BOOKED' : booking.status;

      // ✅ If reactivating, mark unit SOLD again
      if (booking.status === 'CANCELLED') {
        await tx.unit.update({
          where: { id: booking.unitId },
          data: { status: 'SOLD' },
        });
      }

      return tx.booking.update({
        where: { id },
        data: {
          // Builder
          builtUpSqft: dto.builtUpSqft,
          marketRate: dto.marketRate,
          builtUpValue,

          gstAmount: dto.gstAmount,
          maintenanceFee: dto.maintenanceFee,
          advocateFee: dto.advocateFee,
          mecbFee: dto.mecbFee,
          oneTimeMaint: dto.oneTimeMaint,

          // Govt
          govtSqMeter: dto.govtSqMeter,
          govtValue: dto.govtValue,
          stampDuty: dto.stampDuty,
          registrationFee: dto.registrationFee,

          // Totals
          totalPrice: dto.totalPrice,
          govtAmount: dto.govtAmount,
          cashAmount: dto.cashAmount,

          // ✅ IMPORTANT
          status: newStatus,
        },
      });
    });
  }

  getBookingInstallments(bookingId: string) {
    return this.prisma.installmentPlan.findMany({
      where: { bookingId },
      orderBy: { dueDate: 'asc' },
    });
  }
}
