import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { FinanceService } from '../finance/finance.service';

@Injectable()
export class ExpenseService {
  constructor(
    private prisma: PrismaService,
    private finance: FinanceService,
  ) {}

  // ================================
  // 1️⃣ Get expenses (SAFE)
  // ================================
  getProjectExpenses(projectId: string, companyId: string) {
    return this.prisma.expense.findMany({
      where: {
        projectId,
        project: { companyId },
      },
      include: { vendor: true },
      orderBy: { date: 'desc' },
    });
  }

  // ================================
  // 2️⃣ COST REPORT (DETAILED)
  // ================================
  async getProjectCostReport(projectId: string, companyId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, companyId },
    });

    if (!project) {
      throw new BadRequestException('Invalid project access');
    }

    // Expenses
    const expenses = await this.prisma.expense.findMany({
      where: {
        projectId,
        project: { companyId },
      },
    });

    // Material usage
    const materialUsage = await this.prisma.inventoryOutward.findMany({
      where: {
        projectId,
        project: { companyId },
      },
      include: { material: true },
    });

    const materialCost = materialUsage.reduce((sum, m) => {
      return sum + (m.material?.unitCost || 0) * m.quantity;
    }, 0);

    // Labour
    const labourAttendance = await this.prisma.labourAttendance.findMany({
      where: {
        projectId,
        project: { companyId },
        present: true,
      },
    });

    const labourCost = labourAttendance.reduce((sum, l) => {
      return sum + l.wageForDay;
    }, 0);

    // Other (manual + vendor payments + purchases)
    const otherCost = expenses
      .filter((e) =>
        ['OTHER', 'VENDOR_PAYMENT', 'MATERIAL_PURCHASE'].includes(e.type),
      )
      .reduce((sum, e) => sum + e.amount, 0);

    const totalCost = materialCost + labourCost + otherCost;

    // Timeline (combined)
    const timeline = this.buildTimeline(
      expenses,
      labourAttendance,
      materialUsage,
    );

    return {
      projectId,
      projectName: project.name,
      totalCost,
      breakdown: {
        MATERIAL: materialCost,
        LABOUR: labourCost,
        OTHER: otherCost,
      },
      timeline,
    };
  }

  // ================================
  // 3️⃣ MAIN ANALYTICS (DASHBOARD)
  // ================================
  async getProjectAnalytics(projectId: string, companyId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, companyId },
      include: { budget: true },
    });

    if (!project) {
      throw new BadRequestException('Invalid project access');
    }

    // =============================
    // DATA FETCH
    // =============================

    const expenses = await this.prisma.expense.findMany({
      where: {
        projectId,
        project: { companyId },
      },
    });

    const labourAttendance = await this.prisma.labourAttendance.findMany({
      where: {
        projectId,
        project: { companyId },
        present: true,
      },
    });

    const materialUsage = await this.prisma.inventoryOutward.findMany({
      where: {
        projectId,
        project: { companyId },
      },
      include: { material: true },
    });

    const units = await this.prisma.unit.findMany({
      where: {
        projectId,
        companyId,
      },
    });

    const bookings = await this.prisma.booking.findMany({
      where: {
        projectId,
        project: { companyId },
      },
    });

    // Get recent activities for the project
    const recentActivities = await this.getRecentActivities(
      projectId,
      companyId,
    );

    // =============================
    // COST CALCULATIONS
    // =============================

    const materialCost = materialUsage.reduce((sum, m) => {
      return sum + (m.material?.unitCost || 0) * m.quantity;
    }, 0);

    const labourCost = labourAttendance.reduce((sum, l) => {
      return sum + l.wageForDay;
    }, 0);

    const otherCost = expenses
      .filter((e) =>
        ['OTHER', 'VENDOR_PAYMENT', 'MATERIAL_PURCHASE'].includes(e.type),
      )
      .reduce((sum, e) => sum + e.amount, 0);

    const totalCost = materialCost + labourCost + otherCost;

    const totalArea = units.reduce((sum, u) => {
      return sum + (u.areaSqFt || 0);
    }, 0);

    const costPerSqFt = totalArea ? totalCost / totalArea : 0;

    // =============================
    // OVERVIEW STATS CALCULATIONS
    // =============================

    const totalUnits = units.length;
    const bookedUnits = bookings.filter((b) => b.status === 'BOOKED').length;
    const availableUnits = totalUnits - bookedUnits;

    // Calculate revenue from bookings
    const totalRevenue = bookings.reduce(
      (sum, b) => sum + (b.totalPrice || 0),
      0,
    );
    const revenueInCr = totalRevenue / 10000000; // Convert to crores

    // Unit type breakdown
    const unitTypes = units.reduce(
      (acc, unit) => {
        acc[unit.unitType] = (acc[unit.unitType] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    // =============================
    // 🔥 TIMELINE (CORE FIX)
    // =============================

    const timeline = this.buildTimeline(
      expenses,
      labourAttendance,
      materialUsage,
    );

    const cumulativeTimeline = this.buildCumulativeTimeline(timeline);

    // =============================
    // 🔥 LEAD ANALYTICS
    // =============================

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const todayEnquiries = await this.prisma.lead.count({
      where: {
        companyId,
        projectId,
        createdAt: { gte: today, lt: tomorrow },
      },
    });

    const totalEnquiries = await this.prisma.lead.count({
      where: {
        companyId,
        projectId,
      },
    });

    const convertedLeads = await this.prisma.lead.count({
      where: {
        companyId,
        projectId,
        status: 'CONVERTED',
      },
    });

    const followUps = await this.prisma.lead.count({
      where: {
        companyId,
        projectId,
        status: 'FOLLOW_UP',
      },
    });

    const conversionRate =
      totalEnquiries > 0 ? (convertedLeads / totalEnquiries) * 100 : 0;

    // =============================
    // RETURN
    // =============================

    return {
      // Existing data for other components
      totalCost,
      labourCost,
      materialCost,
      costPerSqFt,
      budget: project.budget?.amount || 0,
      timeline,
      cumulativeTimeline,
      todayEnquiries,
      totalEnquiries,
      convertedLeads,
      followUps,
      conversionRate,

      // New formatted data for ProjectOverview
      overviewStats: {
        totalUnits,
        booked: bookedUnits,
        available: availableUnits,
        revenue: revenueInCr.toFixed(1), // 1 decimal place
      },
      unitOverview: {
        plots: unitTypes['PLOT'] || 0,
        flats: unitTypes['FLAT'] || 0,
        villas: unitTypes['VILLA'] || 0,
      },
      financialOverview: {
        totalValue: (totalCost / 10000000).toFixed(1), // Convert to crores
        collected: (totalRevenue / 10000000).toFixed(1), // Convert to crores
        pending: ((totalCost - totalRevenue) / 10000000).toFixed(1), // Convert to crores
      },
      recentActivity: recentActivities,
    };
  }

  // ================================
  // 🔧 HELPER: RECENT ACTIVITIES
  // ================================
  private async getRecentActivities(projectId: string, companyId: string) {
    const activities: string[] = [];

    // Get recent bookings
    const recentBookings = await this.prisma.booking.findMany({
      where: {
        projectId,
        project: { companyId },
      },
      include: { unit: true, customer: true },
      orderBy: { bookingDate: 'desc' },
      take: 3,
    });

    recentBookings.forEach((booking) => {
      activities.push(
        `🏠 ${booking.unit.unitType} ${booking.unit.unitNumber} booked by ${booking.customer.name}`,
      );
    });

    // Get recent payments
    const recentPayments = await this.prisma.payment.findMany({
      where: {
        booking: {
          projectId,
          project: { companyId },
        },
      },
      include: { booking: { include: { unit: true, customer: true } } },
      orderBy: { date: 'desc' },
      take: 2,
    });

    recentPayments.forEach((payment) => {
      activities.push(
        `💰 ₹${payment.amount.toLocaleString()} payment received for ${payment.booking.unit.unitType} ${payment.booking.unit.unitNumber}`,
      );
    });

    // Get recent labour attendance
    const recentLabour = await this.prisma.labourAttendance.findMany({
      where: {
        projectId,
        project: { companyId },
        date: {
          gte: new Date(new Date().setDate(new Date().getDate() - 1)),
        },
      },
      orderBy: { date: 'desc' },
      take: 1,
    });

    if (recentLabour.length > 0) {
      activities.push('👷 Labour attendance marked today');
    }

    return activities.slice(0, 5); // Return max 5 activities
  }

  // ================================
  // 🔧 HELPER: BUILD TIMELINE
  // ================================
  private buildTimeline(expenses, labour, materials) {
    const timeline: Record<string, number> = {};

    // Expenses
    expenses.forEach((e) => {
      const day = e.date.toISOString().split('T')[0];
      timeline[day] = (timeline[day] || 0) + e.amount;
    });

    // Labour
    labour.forEach((l) => {
      const day = l.date.toISOString().split('T')[0];
      timeline[day] = (timeline[day] || 0) + l.wageForDay;
    });

    // Material
    materials.forEach((m) => {
      const day = m.createdAt.toISOString().split('T')[0];
      const cost = (m.material?.unitCost || 0) * m.quantity;

      timeline[day] = (timeline[day] || 0) + cost;
    });

    return timeline;
  }

  // ================================
  // 🔧 HELPER: CUMULATIVE
  // ================================
  private buildCumulativeTimeline(timeline: Record<string, number>) {
    const sortedDates = Object.keys(timeline).sort();

    let runningTotal = 0;

    const cumulative: Record<string, number> = {};

    sortedDates.forEach((date) => {
      runningTotal += timeline[date];
      cumulative[date] = runningTotal;
    });

    return cumulative;
  }

  async createExpense(data: any, companyId: string) {
    // Validate project
    const project = await this.prisma.project.findFirst({
      where: {
        id: data.projectId,
        companyId,
      },
    });

    if (!project) {
      throw new BadRequestException('Invalid project');
    }

    if (data.vendorId) {
      const vendor = await this.prisma.vendor.findFirst({
        where: { id: data.vendorId, companyId },
      });
      if (!vendor) throw new BadRequestException('Invalid vendor');
    }

    const gstRate = Number(data.gstRate || 0);
    const baseAmount = Number(data.amount || 0);
    const gstAmount =
      data.gstAmount != null
        ? Number(data.gstAmount)
        : gstRate
          ? (baseAmount * gstRate) / 100
          : 0;

    const totalAmount = baseAmount + gstAmount;

    return this.prisma.$transaction(async (tx) => {
      const expense = await tx.expense.create({
        data: {
          projectId: data.projectId,
          type: data.type || 'OTHER',
          amount: totalAmount,
          date: new Date(data.date),
          description: data.description || null,
          gstRate: gstRate || null,
          gstAmount: gstAmount || null,
          vendorGST: data.vendorGST || null,
          vendorId: data.vendorId || null,
          bankAccountId: data.bankAccountId || null,
        },
        include: { vendor: true },
      });

      if (data.bankAccountId && totalAmount > 0) {
        await this.finance.postEntry(
          {
            companyId,
            bankAccountId: data.bankAccountId,
            type: 'DEBIT',
            category:
              data.type === 'VENDOR_PAYMENT' ? 'VENDOR_PAYMENT' : 'EXPENSE',
            amount: totalAmount,
            date: new Date(data.date),
            description:
              data.description || `Expense — ${data.type || 'OTHER'}`,
            projectId: data.projectId,
            expenseId: expense.id,
          },
          tx,
        );
      }

      return expense;
    });
  }
}
