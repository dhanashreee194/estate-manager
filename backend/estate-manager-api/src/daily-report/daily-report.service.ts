import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DailyReportService {
  constructor(private prisma: PrismaService) {}

  async createReport(projectId: string, date: Date, workDetails: string) {
    return this.prisma.dailyReport.create({
      data: {
        projectId,
        date,
        workDetails,
      },
    });
  }

  async getProjectReports(projectId: string) {
    return this.prisma.dailyReport.findMany({
      where: { projectId },
      include: {
        labours: true,
        materials: true,
        payments: true,
        goods: true,
      },
      orderBy: { date: 'desc' },
    });
  }

  async addLabour(reportId: string, data: any) {
    const existing = await this.prisma.dailyLabour.findFirst({
      where: { reportId },
    });

    const payload = {
      agency: data.agency || '',
      skilled: Number(data.skilled || 0),
      men: Number(data.men || 0),
      women: Number(data.women || 0),
      total:
        Number(data.skilled || 0) +
        Number(data.men || 0) +
        Number(data.women || 0),
    };

    if (existing) {
      return this.prisma.dailyLabour.update({
        where: { id: existing.id },
        data: payload,
      });
    }

    return this.prisma.dailyLabour.create({
      data: {
        reportId,
        ...payload,
      },
    });
  }

  async addMaterial(reportId: string, data: any) {
    const stock = Number(data.stock || 0);
    const consumed = Number(data.consumed || 0);

    return this.prisma.dailyMaterial.create({
      data: {
        reportId,

        material: data.name || '', // 👈 map name → material
        size: data.size || null,

        stock,
        consumed,

        balance: stock - consumed,
      },
    });
  }

  async addPayment(reportId: string, data: any) {
    return this.prisma.dailyPayment.create({
      data: {
        reportId,
        ...data,
      },
    });
  }

  async addGoods(reportId: string, data: any) {
    return this.prisma.dailyGoods.create({
      data: {
        reportId,
        ...data,
      },
    });
  }

  async updateReport(id: string, body: any) {
    return this.prisma.dailyReport.update({
      where: { id },
      data: {
        date: new Date(body.date),
        workDetails: body.workDetails,
      },
    });
  }

  async getReportById(id: string) {
    return this.prisma.dailyReport.findUnique({
      where: { id },
      include: {
        labours: true,
        materials: true,
        payments: true,
        goods: true,
      },
    });
  }
}
