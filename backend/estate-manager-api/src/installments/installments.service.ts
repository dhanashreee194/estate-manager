import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as PDFDocument from 'pdfkit';
import { Response } from 'express';

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

    const paidAmount = installment.paidAmount + amount;

    let status: any = 'PARTIAL';
    let paid = false;

    if (paidAmount >= installment.amount) {
      status = 'PAID';
      paid = true;
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
    return this.prisma.installmentPlan.updateMany({
      where: {
        id,
        booking: { companyId },
      },
      data: {
        dueDate,
        status: 'UPCOMING',
      },
    });
  }

  async dashboard(companyId: string) {
    const today = new Date();

    const due = await this.prisma.installmentPlan.aggregate({
      _sum: { amount: true },
      where: {
        booking: { companyId },
        status: 'DUE',
      },
    });

    const overdue = await this.prisma.installmentPlan.aggregate({
      _sum: { amount: true },
      where: {
        booking: { companyId },
        status: 'OVERDUE',
      },
    });

    const paid = await this.prisma.installmentPlan.aggregate({
      _sum: { paidAmount: true },
      where: {
        booking: { companyId },
      },
    });

    return {
      due: due._sum.amount || 0,
      overdue: overdue._sum.amount || 0,
      collected: paid._sum.paidAmount || 0,
      today,
    };
  }

  async refreshStatuses(companyId: string) {
    const today = new Date();

    await this.prisma.installmentPlan.updateMany({
      where: {
        booking: { companyId },
        paid: false,
        dueDate: { lt: today },
      },
      data: { status: 'OVERDUE' },
    });

    await this.prisma.installmentPlan.updateMany({
      where: {
        booking: { companyId },
        paid: false,
        dueDate: { gte: today },
      },
      data: { status: 'UPCOMING' },
    });

    return { message: 'Statuses refreshed' };
  }

  async generateDemandLetter(id: string, companyId: string, res: Response) {
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

    const doc = new PDFDocument({ margin: 50 });

    const filename = `Demand_Letter_${unit.unitNumber}.pdf`;

    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    res.setHeader('Content-Type', 'application/pdf');

    doc.pipe(res);

    doc.fontSize(20).text(project.name, { align: 'center' });

    doc.moveDown();

    doc.fontSize(16).text('DEMAND LETTER', {
      align: 'center',
      underline: true,
    });

    doc.moveDown(2);

    doc.fontSize(12).text(`Date: ${new Date().toLocaleDateString()}`);
    doc.text(`Customer Name: ${customer.name}`);
    doc.text(`Unit Number: ${unit.unitNumber}`);
    doc.text(`Milestone: ${installment.milestone}`);
    doc.text(`Due Date: ${new Date(installment.dueDate).toDateString()}`);

    doc.moveDown();

    doc
      .fontSize(14)
      .text(`Amount Due: ₹${installment.amount.toLocaleString()}`, {
        bold: true,
      });

    doc.moveDown(2);

    doc.fontSize(12).text('Kindly make payment on or before due date.');

    doc.moveDown();

    doc.text('Bank Details:');
    doc.text('Account Name: ABC Developers');
    doc.text('Bank: HDFC Bank');
    doc.text('A/C No: XXXXX12345');
    doc.text('IFSC: HDFC0001234');

    doc.moveDown(4);

    doc.text('Authorized Signatory', {
      align: 'right',
    });

    doc.end();
  }
}
