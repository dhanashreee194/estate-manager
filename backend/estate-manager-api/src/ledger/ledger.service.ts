import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class LedgerService {
  constructor(private prisma: PrismaService) {}

  // 1️⃣ Company-wide revenue ledger
  async getCompanyRevenue(companyId: string, from?: string, to?: string) {
    return this.prisma.payment.findMany({
      where: {
        booking: {
          project: {
            companyId,
          },
        },
        ...(from && to
          ? {
              date: {
                gte: new Date(from),
                lte: new Date(to),
              },
            }
          : {}),
      },
      include: {
        booking: {
          include: {
            unit: true,
            customer: true,
            project: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });
  }

  // 2️⃣ Revenue summary (Dashboard KPI)
  async getRevenueSummary(companyId: string) {
    const payments = await this.prisma.payment.findMany({
      where: {
        booking: {
          project: {
            companyId,
          },
        },
      },
    });

    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

    return {
      totalRevenue,
      totalTransactions: payments.length,
    };
  }

  // 3️⃣ Revenue by project
  async getProjectRevenue(projectId: string, companyId: string) {
    const payments = await this.prisma.payment.findMany({
      where: {
        booking: {
          projectId,
          project: {
            companyId,
          },
        },
      },
    });

    const total = payments.reduce((sum, p) => sum + p.amount, 0);

    return {
      projectId,
      totalRevenue: total,
      transactions: payments.length,
    };
  }
}
