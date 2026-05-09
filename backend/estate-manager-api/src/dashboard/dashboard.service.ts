import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  // 🔹 COMPANY DASHBOARD (CORRECT FINANCE LOGIC)
  async getCompanyDashboard(companyId: string) {
    // Payments = REAL revenue
    const payments = await this.prisma.payment.findMany({
      where: {
        booking: {
          project: { companyId },
        },
      },
    });

    const received = payments.reduce((sum, p) => sum + p.amount, 0);

    // Sales (booking value)
    const bookings = await this.prisma.booking.findMany({
      where: {
        project: { companyId },
      },
    });

    const totalSales = bookings.reduce((sum, b) => sum + b.totalPrice, 0);

    // Expenses
    const expenses = await this.prisma.expense.findMany({
      where: {
        project: { companyId },
      },
    });

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    // KPIs
    const projectsCount = await this.prisma.project.count({
      where: { companyId },
    });

    const unitsSold = await this.prisma.unit.count({
      where: {
        status: 'SOLD',
        project: { companyId },
      },
    });

    return {
      sales: {
        total: totalSales,
        received,
        pending: totalSales - received,
      },
      expenses: {
        total: totalExpenses,
      },
      profit: received - totalExpenses, // ✅ CORRECT
      stats: {
        projects: projectsCount,
        unitsSold,
      },
    };
  }

  // 🔹 PROJECT-WISE PROFIT (FIXED)
  async getProjectProfit(projectId: string, companyId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, companyId },
    });

    if (!project) {
      throw new BadRequestException('Invalid project access');
    }

    const bookings = await this.prisma.booking.findMany({
      where: { projectId },
      include: { payments: true },
    });

    const expenses = await this.prisma.expense.findMany({
      where: { projectId },
    });

    const totalSales = bookings.reduce((sum, b) => sum + b.totalPrice, 0);

    const received = bookings.reduce(
      (sum, b) => sum + b.payments.reduce((pSum, p) => pSum + p.amount, 0),
      0,
    );

    const expenseTotal = expenses.reduce((sum, e) => sum + e.amount, 0);

    return {
      projectId,
      projectName: project.name,
      sales: totalSales,
      received,
      expenses: expenseTotal,
      profit: received - expenseTotal, // ✅ FIXED
    };
  }

  // 🔹 CASH FLOW (MONTH-WISE, CORRECT)
  async getCashFlow(companyId: string) {
    const payments = await this.prisma.payment.findMany({
      where: {
        booking: {
          project: { companyId },
        },
      },
    });

    const expenses = await this.prisma.expense.findMany({
      where: {
        project: { companyId },
      },
    });

    const flow: Record<string, { cashIn: number; cashOut: number }> = {};

    for (const p of payments) {
      const month = p.date.toISOString().slice(0, 7);
      flow[month] = flow[month] || { cashIn: 0, cashOut: 0 };
      flow[month].cashIn += p.amount;
    }

    for (const e of expenses) {
      const month = e.date.toISOString().slice(0, 7);
      flow[month] = flow[month] || { cashIn: 0, cashOut: 0 };
      flow[month].cashOut += e.amount;
    }

    return Object.entries(flow).map(([month, data]) => ({
      month,
      ...data,
      net: data.cashIn - data.cashOut,
    }));
  }
}
