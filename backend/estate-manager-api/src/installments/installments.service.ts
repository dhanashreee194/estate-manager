import { BadRequestException, Injectable } from '@nestjs/common';
import { InstallmentStatus, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { Response } from 'express';
import {
  createPdfDoc,
  demandCopy,
  localeFor,
  normalizePdfLang,
  pdfFont,
} from '../common/pdf-i18n';

@Injectable()
export class InstallmentsService {
  constructor(private prisma: PrismaService) {}

  async getBookingInstallments(bookingId: string, companyId: string) {
    return this.prisma.installmentPlan.findMany({
      where: {
        bookingId,
        booking: { companyId },
      },
      orderBy: { dueDate: 'asc' },
    });
  }

  /** Company-wide installment list for collections / overdue polish */
  async list(
    companyId: string,
    filters?: {
      status?: string;
      projectId?: string;
      overdueOnly?: boolean;
    },
  ) {
    await this.refreshStatuses(companyId);

    const today = startOfDay(new Date());

    const where: Prisma.InstallmentPlanWhereInput = {
      booking: {
        companyId,
        ...(filters?.projectId ? { projectId: filters.projectId } : {}),
      },
      status: { not: InstallmentStatus.CANCELLED },
    };

    if (filters?.overdueOnly) {
      where.paid = false;
      where.OR = [
        { status: InstallmentStatus.OVERDUE },
        {
          status: { in: [InstallmentStatus.DUE, InstallmentStatus.PARTIAL] },
          dueDate: { lt: today },
        },
      ];
    } else if (filters?.status) {
      where.status = filters.status as InstallmentStatus;
    }

    const rows = await this.prisma.installmentPlan.findMany({
      where,
      include: {
        booking: {
          include: {
            customer: true,
            unit: true,
            project: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: [{ dueDate: 'asc' }, { milestone: 'asc' }],
      take: 500,
    });

    return rows.map((r) => {
      const balance = Math.max(0, r.amount - (r.paidAmount || 0));
      const daysOverdue =
        !r.paid && r.dueDate < today
          ? Math.floor(
              (today.getTime() - startOfDay(r.dueDate).getTime()) /
                (1000 * 60 * 60 * 24),
            )
          : 0;
      return {
        id: r.id,
        bookingId: r.bookingId,
        milestone: r.milestone,
        amount: r.amount,
        paidAmount: r.paidAmount || 0,
        balance,
        dueDate: r.dueDate,
        status: r.status,
        paid: r.paid,
        daysOverdue,
        customerName: r.booking.customer?.name,
        customerPhone: r.booking.customer?.phone,
        unitNumber: r.booking.unit?.unitNumber,
        projectId: r.booking.project?.id,
        projectName: r.booking.project?.name,
      };
    });
  }

  async payInstallment(id: string, amount: number, companyId: string) {
    const installment = await this.prisma.installmentPlan.findFirst({
      where: {
        id,
        booking: { companyId },
      },
    });

    if (!installment) {
      throw new BadRequestException('Installment not found');
    }

    const paidAmount = (installment.paidAmount || 0) + amount;

    let status: InstallmentStatus = InstallmentStatus.PARTIAL;
    let paid = false;

    if (paidAmount >= installment.amount) {
      status = InstallmentStatus.PAID;
      paid = true;
    } else {
      status = this.statusForOpenInstallment(
        installment.dueDate,
        paidAmount,
      );
    }

    return this.prisma.installmentPlan.update({
      where: { id },
      data: {
        paidAmount,
        paid,
        status,
      },
    });
  }

  async reschedule(id: string, dueDate: Date, companyId: string) {
    const installment = await this.prisma.installmentPlan.findFirst({
      where: { id, booking: { companyId } },
    });
    if (!installment) throw new BadRequestException('Installment not found');
    if (installment.paid) {
      throw new BadRequestException('Cannot reschedule a paid installment');
    }

    const status = this.statusForOpenInstallment(
      dueDate,
      installment.paidAmount || 0,
    );

    return this.prisma.installmentPlan.update({
      where: { id },
      data: { dueDate, status },
    });
  }

  async dashboard(companyId: string) {
    await this.refreshStatuses(companyId);

    const rows = await this.prisma.installmentPlan.findMany({
      where: {
        booking: { companyId },
        status: { not: InstallmentStatus.CANCELLED },
      },
    });

    const balanceOf = (r: { amount: number; paidAmount: number }) =>
      Math.max(0, r.amount - (r.paidAmount || 0));

    const overdueRows = rows.filter((r) => r.status === 'OVERDUE');
    const dueRows = rows.filter((r) => r.status === 'DUE');
    const partialRows = rows.filter((r) => r.status === 'PARTIAL');
    const upcomingRows = rows.filter((r) => r.status === 'UPCOMING');

    return {
      overdue: overdueRows.reduce((s, r) => s + balanceOf(r), 0),
      due: dueRows.reduce((s, r) => s + balanceOf(r), 0),
      partial: partialRows.reduce((s, r) => s + balanceOf(r), 0),
      upcoming: upcomingRows.reduce((s, r) => s + balanceOf(r), 0),
      collected: rows.reduce((s, r) => s + (r.paidAmount || 0), 0),
      counts: {
        overdue: overdueRows.length,
        due: dueRows.length,
        partial: partialRows.length,
        upcoming: upcomingRows.length,
        paid: rows.filter((r) => r.status === 'PAID').length,
      },
      today: new Date(),
    };
  }

  async refreshStatuses(companyId: string) {
    const open = await this.prisma.installmentPlan.findMany({
      where: {
        booking: { companyId },
        status: { notIn: [InstallmentStatus.CANCELLED] },
      },
    });

    let updated = 0;
    for (const row of open) {
      let status: InstallmentStatus;
      let paid = row.paid;

      if ((row.paidAmount || 0) >= row.amount) {
        status = InstallmentStatus.PAID;
        paid = true;
      } else if (paid) {
        // paid flag but incomplete amount — treat as open
        paid = false;
        status = this.statusForOpenInstallment(
          row.dueDate,
          row.paidAmount || 0,
        );
      } else {
        status = this.statusForOpenInstallment(
          row.dueDate,
          row.paidAmount || 0,
        );
      }

      if (status !== row.status || paid !== row.paid) {
        await this.prisma.installmentPlan.update({
          where: { id: row.id },
          data: { status, paid },
        });
        updated += 1;
      }
    }

    return { message: 'Statuses refreshed', checked: open.length, updated };
  }

  private statusForOpenInstallment(
    dueDate: Date,
    paidAmount: number,
  ): InstallmentStatus {
    const today = startOfDay(new Date());
    const due = startOfDay(dueDate);

    if (paidAmount > 0) {
      // Partial: overdue if past due, else PARTIAL
      if (due < today) return InstallmentStatus.OVERDUE;
      return InstallmentStatus.PARTIAL;
    }

    if (due < today) return InstallmentStatus.OVERDUE;
    if (due.getTime() === today.getTime()) return InstallmentStatus.DUE;
    return InstallmentStatus.UPCOMING;
  }

  async generateDemandLetter(
    id: string,
    companyId: string,
    res: Response,
    langRaw?: string,
  ) {
    const lang = normalizePdfLang(langRaw);
    const L = demandCopy(lang);
    const loc = localeFor(lang);

    const installment = await this.prisma.installmentPlan.findFirst({
      where: {
        id,
        booking: { companyId },
      },
      include: {
        booking: {
          include: {
            customer: true,
            unit: true,
            project: true,
            company: true,
          },
        },
      },
    });

    if (!installment) {
      throw new BadRequestException('Installment not found');
    }

    const customer = installment.booking.customer;
    const unit = installment.booking.unit;
    const project = installment.booking.project;
    const company = installment.booking.company;
    const balance = Math.max(
      0,
      installment.amount - (installment.paidAmount || 0),
    );

    const doc = createPdfDoc(lang);
    const filename = `Demand_Letter_${unit.unitNumber}_${installment.milestone}.pdf`;

    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/pdf');
    doc.pipe(res);

    pdfFont(doc).fontSize(18).text(company?.name || project.name, {
      align: 'center',
    });
    doc.moveDown(0.5);
    pdfFont(doc).fontSize(11).text(project.name, { align: 'center' });
    doc.moveDown();
    pdfFont(doc).fontSize(16).text(L.title, {
      align: 'center',
      underline: true,
    });
    doc.moveDown(2);

    pdfFont(doc)
      .fontSize(12)
      .text(`${L.date}: ${new Date().toLocaleDateString(loc)}`);
    doc.text(`${L.customer}: ${customer.name}`);
    if (customer.phone) doc.text(`${L.phone}: ${customer.phone}`);
    doc.text(`${L.unit}: ${unit.unitNumber}`);
    doc.text(`${L.milestone}: ${installment.milestone}`);
    doc.text(
      `${L.dueDate}: ${new Date(installment.dueDate).toLocaleDateString(loc)}`,
    );
    doc.text(`${L.status}: ${installment.status}`);
    doc.moveDown();

    doc.text(
      `${L.installmentAmount}: ₹${installment.amount.toLocaleString(loc)}`,
    );
    doc.text(
      `${L.alreadyPaid}: ₹${(installment.paidAmount || 0).toLocaleString(loc)}`,
    );
    pdfFont(doc)
      .fontSize(14)
      .text(`${L.balanceDue}: ₹${balance.toLocaleString(loc)}`);

    doc.moveDown(2);
    pdfFont(doc).fontSize(12).text(L.body);

    doc.moveDown(3);
    doc.text(L.signatory, { align: 'right' });
    doc.end();
  }
}

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
