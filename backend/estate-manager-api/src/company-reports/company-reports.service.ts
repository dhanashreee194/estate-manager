import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CompanyReportsService {
  constructor(private prisma: PrismaService) {}

  // ================================
  // COMPANY ANALYTICS
  // ================================
  async getCompanyAnalytics(companyId: string) {
    const projects = await this.prisma.project.findMany({
      where: { companyId },
      select: { id: true },
    });

    const projectIds = projects.map((p) => p.id);

    const expenses = await this.prisma.expense.findMany({
      where: {
        projectId: { in: projectIds },
      },
    });

    const labour = await this.prisma.labourAttendance.findMany({
      where: {
        projectId: { in: projectIds },
        present: true,
      },
    });

    const materials = await this.prisma.inventoryOutward.findMany({
      where: {
        projectId: { in: projectIds },
      },
      include: { material: true },
    });

    const materialCost = materials.reduce((sum, m) => {
      return sum + (m.material?.unitCost || 0) * m.quantity;
    }, 0);

    const labourCost = labour.reduce((sum, l) => {
      return sum + l.wageForDay;
    }, 0);

    const otherCost = expenses
      .filter((e) => e.type === 'OTHER')
      .reduce((sum, e) => sum + e.amount, 0);

    const totalCost = materialCost + labourCost + otherCost;

    const timeline = this.buildTimeline(expenses, labour, materials);

    const cumulativeTimeline = this.buildCumulativeTimeline(timeline);

    const totalProjects = projects.length;

    const totalEnquiries = await this.prisma.lead.count({
      where: { companyId },
    });

    const convertedLeads = await this.prisma.lead.count({
      where: {
        companyId,
        status: 'CONVERTED',
      },
    });

    const followUps = await this.prisma.lead.count({
      where: {
        companyId,
        status: 'FOLLOW_UP',
      },
    });

    const conversionRate =
      totalEnquiries > 0 ? (convertedLeads / totalEnquiries) * 100 : 0;

    return {
      totalCost,
      materialCost,
      labourCost,

      timeline,
      cumulativeTimeline,

      totalProjects,
      totalEnquiries,
      convertedLeads,
      followUps,
      conversionRate,
    };
  }

  // ================================
  // TIMELINE
  // ================================
  async getCompanyTimeline(companyId: string) {
    const analytics = await this.getCompanyAnalytics(companyId);

    return analytics.timeline;
  }

  // ================================
  // HELPERS
  // ================================
  private buildTimeline(expenses, labour, materials) {
    const timeline: Record<string, number> = {};

    expenses.forEach((e) => {
      const day = e.date.toISOString().split('T')[0];
      timeline[day] = (timeline[day] || 0) + e.amount;
    });

    labour.forEach((l) => {
      const day = l.date.toISOString().split('T')[0];
      timeline[day] = (timeline[day] || 0) + l.wageForDay;
    });

    materials.forEach((m) => {
      const day = m.createdAt.toISOString().split('T')[0];

      const cost = (m.material?.unitCost || 0) * m.quantity;

      timeline[day] = (timeline[day] || 0) + cost;
    });

    return timeline;
  }

  private buildCumulativeTimeline(timeline: Record<string, number>) {
    const dates = Object.keys(timeline).sort();

    let running = 0;

    const cumulative: Record<string, number> = {};

    dates.forEach((d) => {
      running += timeline[d];
      cumulative[d] = running;
    });

    return cumulative;
  }
}
