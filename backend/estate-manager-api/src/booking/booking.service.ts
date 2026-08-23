import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import type { Response } from 'express';
import {
  agreementCopy,
  createPdfDoc,
  localeFor,
  normalizePdfLang,
  pdfFont,
} from '../common/pdf-i18n';

@Injectable()
export class BookingService {
  constructor(private prisma: PrismaService) {}

  // 1️⃣ Create booking (DOUBLE-BOOKING SAFE)
  async createBooking(dto: CreateBookingDto, user: any) {
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

      // 2. Broker (optional)
      let broker = null as null | { id: string; commissionRate: number };
      if (dto.brokerId) {
        broker = await tx.broker.findFirst({
          where: {
            id: dto.brokerId,
            companyId: user.companyId,
            isActive: true,
          },
        });
        if (!broker) {
          throw new BadRequestException('Invalid or inactive broker');
        }
      }

      // 3. Calculations
      const builtUpValue = dto.builtUpSqft * dto.marketRate;

      // 4. Booking
      const booking = await tx.booking.create({
        data: {
          unitId: dto.unitId,
          projectId: dto.projectId,

          customerId: customer.id,
          companyId: user.companyId,
          createdById: user.id,
          brokerId: broker?.id || null,

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

      // 5. Mark Unit Sold
      await tx.unit.update({
        where: { id: dto.unitId },
        data: { status: 'SOLD' },
      });

      // 6. Commission for broker
      if (broker) {
        const rate =
          dto.commissionRate !== undefined && dto.commissionRate !== null
            ? Number(dto.commissionRate)
            : broker.commissionRate;
        const commissionAmount = (booking.totalPrice * rate) / 100;

        await tx.brokerCommission.create({
          data: {
            companyId: user.companyId,
            brokerId: broker.id,
            bookingId: booking.id,
            rate,
            dealAmount: booking.totalPrice,
            commissionAmount,
            status: 'PENDING',
          },
        });
      }

      const stages = [
        { name: 'Booking', percent: 30, monthsOffset: 0 },
        { name: 'Plinth', percent: 20, monthsOffset: 3 },
        { name: 'Slab', percent: 20, monthsOffset: 6 },
        { name: 'Possession', percent: 30, monthsOffset: 12 },
      ];

      for (const stage of stages) {
        const dueDate = new Date();
        dueDate.setMonth(dueDate.getMonth() + stage.monthsOffset);
        dueDate.setHours(0, 0, 0, 0);

        await tx.installmentPlan.create({
          data: {
            bookingId: booking.id,
            milestone: stage.name,
            amount: (booking.totalPrice * stage.percent) / 100,
            dueDate,
            status: stage.monthsOffset === 0 ? 'DUE' : 'UPCOMING',
          },
        });
      }

      return tx.booking.findUnique({
        where: { id: booking.id },
        include: {
          broker: true,
          commission: true,
          customer: true,
          unit: true,
        },
      });
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
        broker: true,
        commission: true,
        createdBy: { select: { id: true, name: true } },
      },
      orderBy: {
        bookingDate: 'desc',
      },
    });
  }

  // 3️⃣ Cancel booking
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
        commission: true,
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

      if (booking.commission && booking.commission.status === 'PENDING') {
        await tx.brokerCommission.update({
          where: { id: booking.commission.id },
          data: { status: 'CANCELLED' },
        });
      }

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
        commission: true,
      },
    });

    if (!booking) {
      throw new BadRequestException('Booking not found');
    }

    let brokerId = booking.brokerId;
    let brokerRate: number | null = null;

    if (dto.brokerId !== undefined) {
      if (!dto.brokerId) {
        brokerId = null;
      } else {
        const broker = await this.prisma.broker.findFirst({
          where: { id: dto.brokerId, companyId, isActive: true },
        });
        if (!broker) throw new BadRequestException('Invalid or inactive broker');
        brokerId = broker.id;
        brokerRate = broker.commissionRate;
      }
    }

    const builtUpValue = dto.builtUpSqft * dto.marketRate;

    return this.prisma.$transaction(async (tx) => {
      const newStatus =
        booking.status === 'CANCELLED' ? 'BOOKED' : booking.status;

      if (booking.status === 'CANCELLED') {
        await tx.unit.update({
          where: { id: booking.unitId },
          data: { status: 'SOLD' },
        });
      }

      const updated = await tx.booking.update({
        where: { id },
        data: {
          builtUpSqft: dto.builtUpSqft,
          marketRate: dto.marketRate,
          builtUpValue,

          gstAmount: dto.gstAmount,
          maintenanceFee: dto.maintenanceFee,
          advocateFee: dto.advocateFee,
          mecbFee: dto.mecbFee,
          oneTimeMaint: dto.oneTimeMaint,

          govtSqMeter: dto.govtSqMeter,
          govtValue: dto.govtValue,
          stampDuty: dto.stampDuty,
          registrationFee: dto.registrationFee,

          totalPrice: dto.totalPrice,
          govtAmount: dto.govtAmount,
          cashAmount: dto.cashAmount,

          brokerId,
          status: newStatus,
        },
        include: { broker: true, commission: true, customer: true, unit: true },
      });

      // Sync commission record
      if (brokerId && brokerRate != null) {
        const rate =
          dto.commissionRate !== undefined && dto.commissionRate !== null
            ? Number(dto.commissionRate)
            : brokerRate;
        const commissionAmount = (updated.totalPrice * rate) / 100;

        if (booking.commission) {
          if (booking.commission.status !== 'PAID') {
            await tx.brokerCommission.update({
              where: { id: booking.commission.id },
              data: {
                brokerId,
                rate,
                dealAmount: updated.totalPrice,
                commissionAmount,
                status:
                  booking.status === 'CANCELLED' && newStatus === 'BOOKED'
                    ? 'PENDING'
                    : booking.commission.status === 'CANCELLED'
                      ? 'PENDING'
                      : booking.commission.status,
              },
            });
          }
        } else {
          await tx.brokerCommission.create({
            data: {
              companyId,
              brokerId,
              bookingId: updated.id,
              rate,
              dealAmount: updated.totalPrice,
              commissionAmount,
              status: 'PENDING',
            },
          });
        }
      } else if (!brokerId && booking.commission?.status === 'PENDING') {
        await tx.brokerCommission.update({
          where: { id: booking.commission.id },
          data: { status: 'CANCELLED' },
        });
      }

      return tx.booking.findUnique({
        where: { id },
        include: { broker: true, commission: true, customer: true, unit: true },
      });
    });
  }

  getBookingInstallments(bookingId: string) {
    return this.prisma.installmentPlan.findMany({
      where: { bookingId },
      orderBy: { dueDate: 'asc' },
    });
  }

  /**
   * Allotment / booking agreement PDF for a booking.
   */
  async generateAllotmentLetter(
    bookingId: string,
    companyId: string,
    res: Response,
    langRaw?: string,
  ) {
    const lang = normalizePdfLang(langRaw);
    const L = agreementCopy(lang);
    const loc = localeFor(lang);

    const booking = await this.prisma.booking.findFirst({
      where: { id: bookingId, companyId },
      include: {
        customer: true,
        unit: { include: { wing: true } },
        project: true,
        company: true,
        broker: true,
        installments: { orderBy: { dueDate: 'asc' } },
        payments: { orderBy: { date: 'asc' } },
      },
    });

    if (!booking) {
      throw new BadRequestException('Booking not found');
    }

    const bank = await this.prisma.bankAccount.findFirst({
      where: {
        companyId,
        isActive: true,
        OR: [{ isDefault: true }, { accountType: 'BANK' }],
      },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
    });

    const paid = booking.payments.reduce((s, p) => s + p.amount, 0);
    const balance = Math.max(0, booking.totalPrice - paid);
    const ref =
      booking.bookingNumber ||
      `BK-${booking.id.slice(0, 8).toUpperCase()}`;
    const unit = booking.unit;
    const customer = booking.customer;
    const project = booking.project;
    const company = booking.company;

    const doc = createPdfDoc(lang);
    const filename = `Allotment_${unit.unitNumber}_${ref}.pdf`;

    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/pdf');
    doc.pipe(res);

    const money = (n: number | null | undefined) =>
      `₹ ${Number(n || 0).toLocaleString(loc, { maximumFractionDigits: 0 })}`;

    pdfFont(doc).fontSize(18).text(company.name, { align: 'center' });
    if (project.location) {
      pdfFont(doc)
        .fontSize(10)
        .fillColor('#444')
        .text(project.location, { align: 'center' });
    }
    doc.fillColor('#000');
    doc.moveDown(0.4);
    pdfFont(doc)
      .fontSize(11)
      .text(`${L.project}: ${project.name}`, { align: 'center' });
    doc.moveDown(0.8);
    pdfFont(doc).fontSize(15).text(L.title, {
      align: 'center',
      underline: true,
    });
    doc.moveDown(1.2);

    pdfFont(doc).fontSize(11);
    doc.text(`${L.agreementDate}: ${new Date().toLocaleDateString(loc)}`);
    doc.text(
      `${L.bookingDate}: ${new Date(booking.bookingDate).toLocaleDateString(loc)}`,
    );
    doc.text(`${L.bookingRef}: ${ref}`);
    doc.text(`${L.status}: ${booking.status}`);
    doc.moveDown();

    pdfFont(doc).text(L.allottee);
    pdfFont(doc);
    doc.text(`${L.name}: ${customer.name}`);
    doc.text(`${L.phone}: ${customer.phone}`);
    if (customer.email) doc.text(`${L.email}: ${customer.email}`);
    if (customer.address) doc.text(`${L.address}: ${customer.address}`);
    if (customer.panNumber) doc.text(`${L.pan}: ${customer.panNumber}`);
    if (customer.aadharNumber) doc.text(`${L.aadhaar}: ${customer.aadharNumber}`);
    doc.moveDown();

    pdfFont(doc).text(L.unitSection);
    pdfFont(doc);
    doc.text(`${L.unitNo}: ${unit.unitNumber}`);
    doc.text(`${L.type}: ${unit.unitType}`);
    if (unit.wing?.name) doc.text(`${L.wing}: ${unit.wing.name}`);
    if (unit.floor != null) doc.text(`${L.floor}: ${unit.floor}`);
    if (unit.bhkType) doc.text(`${L.config}: ${unit.bhkType}`);
    doc.text(`${L.area}: ${unit.areaSqFt} sq.ft`);
    if (unit.direction) doc.text(`${L.facing}: ${unit.direction}`);
    if (booking.broker?.name) {
      doc.text(`${L.broker}: ${booking.broker.name}`);
    }
    doc.moveDown();

    pdfFont(doc).text(L.consideration);
    pdfFont(doc);
    doc.text(
      `${L.builtUp}: ${booking.builtUpSqft} sq.ft × ${money(booking.marketRate)} = ${money(booking.builtUpValue)}`,
    );
    doc.text(`${L.gst}: ${money(booking.gstAmount)}`);
    doc.text(`${L.maintenance}: ${money(booking.maintenanceFee)}`);
    doc.text(`${L.advocate}: ${money(booking.advocateFee)}`);
    doc.text(`${L.mecb}: ${money(booking.mecbFee)}`);
    doc.text(`${L.oneTime}: ${money(booking.oneTimeMaint)}`);
    doc.text(`${L.govtCharges}: ${money(booking.govtAmount)}`);
    pdfFont(doc).text(`${L.totalValue}: ${money(booking.totalPrice)}`);
    pdfFont(doc);
    if (booking.bookingAmount != null) {
      doc.text(`${L.bookingAmount}: ${money(booking.bookingAmount)}`);
    }
    if (booking.tokenAmount != null) {
      doc.text(`${L.tokenAmount}: ${money(booking.tokenAmount)}`);
    }
    doc.text(
      `${L.paymentSplit}: ${money(booking.cashAmount)} · ${L.bank}: ${money(booking.bankAmount)} · ${L.loan}: ${money(booking.loanAmount)}`,
    );
    doc.moveDown();

    pdfFont(doc).text(L.schedule);
    pdfFont(doc).fontSize(10);
    if (!booking.installments.length) {
      doc.text(L.noSchedule);
    } else {
      for (const inst of booking.installments) {
        const instBal = Math.max(0, inst.amount - (inst.paidAmount || 0));
        doc.text(
          `${inst.milestone} — ${L.due} ${new Date(inst.dueDate).toLocaleDateString(loc)} — ${money(inst.amount)} (${L.paid} ${money(inst.paidAmount)} · ${L.bal} ${money(instBal)}) — ${inst.status}`,
        );
      }
    }
    doc.fontSize(11).moveDown();

    pdfFont(doc).text(
      `${L.received}: ${money(paid)} · ${L.balance}: ${money(balance)}`,
    );
    pdfFont(doc).moveDown();

    let termsNum = 5;
    if (bank) {
      pdfFont(doc).text(L.bankDetails);
      pdfFont(doc);
      doc.text(`${L.accountName}: ${bank.name}`);
      if (bank.bankName) doc.text(`${L.bankName}: ${bank.bankName}`);
      if (bank.accountNumber) doc.text(`${L.accountNo}: ${bank.accountNumber}`);
      if (bank.ifsc) doc.text(`${L.ifsc}: ${bank.ifsc}`);
      doc.moveDown();
      termsNum = 6;
    }

    pdfFont(doc).text(`${termsNum}. ${L.termsTitle}`);
    pdfFont(doc).fontSize(9);
    for (const t of L.terms) {
      doc.text(`• ${t}`, { align: 'left' });
      doc.moveDown(0.3);
    }

    doc.moveDown(2);
    pdfFont(doc).fontSize(11);
    const sigY = doc.y;
    doc.text('________________________', 50, sigY);
    doc.text('________________________', 320, sigY);
    doc.text(L.allotteeSign, 50, sigY + 16);
    doc.text(L.authSign, 320, sigY + 16);
    doc.text(`(${customer.name})`, 50, sigY + 30);
    doc.text(`(${company.name})`, 320, sigY + 30);

    doc.end();
  }
}
