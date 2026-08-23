import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import {
  CashbookCategory,
  CashbookEntryType,
  InstallmentStatus,
  PaymentMode,
  BookingStatus,
} from '@prisma/client';
import { FinanceService } from '../finance/finance.service';

@Injectable()
export class PaymentService {
  constructor(
    private prisma: PrismaService,
    private finance: FinanceService,
  ) {}

  // 1️⃣ Add payment (INSTALLMENT SAFE)
  async addPayment(dto: CreatePaymentDto, user: any) {
    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          bookingId: dto.bookingId,
          companyId: user.companyId,
          amount: dto.amount,
          stage: dto.stage,
          mode: dto.mode as PaymentMode,
          installmentId: dto.installmentId,
          remarks: dto.remarks,
          bankAccountId: dto.bankAccountId || null,
        },
      });

      if (dto.installmentId) {
        const installment = await tx.installmentPlan.findUnique({
          where: { id: dto.installmentId },
        });

        if (!installment) {
          throw new BadRequestException('Installment not found');
        }

        const newPaidAmount = (installment.paidAmount || 0) + dto.amount;

        let paid = false;
        let status: InstallmentStatus = InstallmentStatus.PARTIAL;

        if (newPaidAmount >= installment.amount) {
          paid = true;
          status = InstallmentStatus.PAID;
        } else {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const due = new Date(installment.dueDate);
          due.setHours(0, 0, 0, 0);
          if (due < today) status = InstallmentStatus.OVERDUE;
          else status = InstallmentStatus.PARTIAL;
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

      if (dto.bankAccountId) {
        await this.finance.postEntry(
          {
            companyId: user.companyId,
            bankAccountId: dto.bankAccountId,
            type: CashbookEntryType.CREDIT,
            category: CashbookCategory.BOOKING_RECEIPT,
            amount: dto.amount,
            description:
              dto.remarks ||
              `Booking receipt — ${dto.stage || 'payment'}`,
            reference: dto.stage,
            projectId: booking.projectId,
            paymentId: payment.id,
          },
          tx,
        );
      }

      return payment;
    });
  }

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

  async getProjectRevenue(projectId: string, companyId: string) {
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
