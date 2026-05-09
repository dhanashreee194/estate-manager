import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentMode, BookingStatus } from '@prisma/client';

@Injectable()
export class PaymentService {
  constructor(private prisma: PrismaService) {}

  // 1️⃣ Add payment (INSTALLMENT SAFE)
  async addPayment(dto: CreatePaymentDto, user: any) {
    return this.prisma.$transaction(async (tx) => {
      // 1️⃣ create payment
      const payment = await tx.payment.create({
        data: {
          bookingId: dto.bookingId,
          companyId: user.companyId,

          amount: dto.amount,
          stage: dto.stage,
          mode: dto.mode as PaymentMode,

          installmentId: dto.installmentId, // NEW
          remarks: dto.remarks,
        },
      });

      // 2️⃣ mark installment paid
      if (dto.installmentId) {
        const installment = await tx.installmentPlan.findUnique({
          where: { id: dto.installmentId },
        });

        if (!installment) {
          throw new BadRequestException('Installment not found');
        }

        const newPaidAmount = (installment.paidAmount || 0) + dto.amount;

        let paid = false;
        let status: any = 'PARTIAL';

        if (newPaidAmount >= installment.amount) {
          paid = true;
          status = 'PAID';
        }

        await tx.installmentPlan.update({
          where: { id: dto.installmentId },
          data: {
            paidAmount: newPaidAmount,
            paid,
            status,
          },
        });
      }

      // 3️⃣ update booking status
      // 3️⃣ update booking status
      const booking = await tx.booking.findUnique({
        where: { id: dto.bookingId },
        include: { payments: true },
      });

      if (!booking) {
        throw new BadRequestException('Booking not found');
      }

      const paid =
        booking.payments.reduce((s, p) => s + p.amount, 0) + dto.amount;

      let status: BookingStatus = booking.status;

      if (paid === 0) status = BookingStatus.BOOKED;
      else if (paid < booking.totalPrice) status = BookingStatus.PARTIAL_PAID;
      else status = BookingStatus.FULLY_PAID;

      await tx.booking.update({
        where: { id: dto.bookingId },
        data: { status },
      });

      return payment;
    });
  }

  // 2️⃣ Get payments for booking (COMPANY SAFE)
  getBookingPayments(bookingId: string, companyId: string) {
    return this.prisma.payment.findMany({
      where: {
        bookingId,
        companyId,
      },
      orderBy: {
        date: 'asc',
      },
    });
  }

  // 3️⃣ Revenue summary by project (GOLD FEATURE)
  async getProjectRevenue(projectId: string, companyId: string) {
    // 🔐 Validate project ownership
    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        companyId,
      },
    });

    if (!project) {
      throw new BadRequestException('Invalid project access');
    }

    const bookings = await this.prisma.booking.findMany({
      where: {
        projectId,
        project: {
          companyId,
        },
      },
      include: {
        payments: true,
      },
    });

    const totalSales = bookings.reduce((sum, b) => sum + b.totalPrice, 0);

    const received = bookings.reduce(
      (sum, b) => sum + b.payments.reduce((pSum, p) => pSum + p.amount, 0),
      0,
    );

    return {
      projectId,
      projectName: project.name,
      totalSales,
      received,
      pending: totalSales - received,
      unitsSold: bookings.length,
    };
  }

  async getBookingLedger(bookingId: string, companyId: string) {
    const booking = await this.prisma.booking.findFirst({
      where: {
        id: bookingId,
        companyId,
      },
      include: {
        payments: {
          orderBy: { date: 'asc' },
        },
        installments: {
          orderBy: { dueDate: 'asc' },
        },
        unit: true,
        customer: true,
      },
    });

    if (!booking) {
      throw new BadRequestException('Booking not found');
    }

    const totalPaid = booking.payments.reduce((sum, p) => sum + p.amount, 0);

    const balance = booking.totalPrice - totalPaid;

    const paidInstallments = booking.installments.filter((i) => i.paid);
    const pendingInstallments = booking.installments.filter((i) => !i.paid);

    return {
      bookingId: booking.id,

      customer: booking.customer,
      unit: booking.unit,

      totalPrice: booking.totalPrice,
      totalPaid,
      balance,

      status: booking.status,

      installments: booking.installments,
      paidInstallments,
      pendingInstallments,

      payments: booking.payments,
    };
  }
}
