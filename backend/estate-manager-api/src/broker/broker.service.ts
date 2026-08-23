import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBrokerDto } from './dto/create-broker.dto';
import { UpdateBrokerDto } from './dto/update-broker.dto';
import { FinanceService } from '../finance/finance.service';
import { CashbookCategory, CashbookEntryType } from '@prisma/client';

@Injectable()
export class BrokerService {
  constructor(
    private prisma: PrismaService,
    private finance: FinanceService,
  ) {}

  create(dto: CreateBrokerDto, companyId: string) {
    if (dto.commissionRate < 0 || dto.commissionRate > 100) {
      throw new BadRequestException('Commission rate must be 0–100%');
    }
    return this.prisma.broker.create({
      data: {
        companyId,
        name: dto.name,
        phone: dto.phone,
        email: dto.email,
        panNumber: dto.panNumber,
        address: dto.address,
        commissionRate: Number(dto.commissionRate),
      },
    });
  }

  findAll(companyId: string, activeOnly = true) {
    return this.prisma.broker.findMany({
      where: {
        companyId,
        ...(activeOnly ? { isActive: true } : {}),
      },
      include: {
        _count: { select: { bookings: true, commissions: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string, companyId: string) {
    const broker = await this.prisma.broker.findFirst({
      where: { id, companyId },
      include: {
        commissions: {
          include: {
            booking: {
              include: {
                customer: true,
                unit: true,
                project: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        bookings: {
          take: 20,
          orderBy: { bookingDate: 'desc' },
          include: { customer: true, unit: true },
        },
      },
    });
    if (!broker) throw new NotFoundException('Broker not found');

    const pending = broker.commissions
      .filter((c) => c.status === 'PENDING')
      .reduce((s, c) => s + c.commissionAmount, 0);
    const paid = broker.commissions
      .filter((c) => c.status === 'PAID')
      .reduce((s, c) => s + (c.paidAmount ?? c.commissionAmount), 0);

    return {
      ...broker,
      totals: {
        pendingCommission: pending,
        paidCommission: paid,
        deals: broker.commissions.length,
      },
    };
  }

  async update(id: string, dto: UpdateBrokerDto, companyId: string) {
    const broker = await this.prisma.broker.findFirst({
      where: { id, companyId },
    });
    if (!broker) throw new NotFoundException('Broker not found');

    if (
      dto.commissionRate !== undefined &&
      (dto.commissionRate < 0 || dto.commissionRate > 100)
    ) {
      throw new BadRequestException('Commission rate must be 0–100%');
    }

    return this.prisma.broker.update({
      where: { id },
      data: { ...dto },
    });
  }

  async deactivate(id: string, companyId: string) {
    const broker = await this.prisma.broker.findFirst({
      where: { id, companyId },
    });
    if (!broker) throw new NotFoundException('Broker not found');
    return this.prisma.broker.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /** Company-wide commission ledger */
  async getCommissions(
    companyId: string,
    filters?: { status?: string; brokerId?: string },
  ) {
    return this.prisma.brokerCommission.findMany({
      where: {
        companyId,
        ...(filters?.status ? { status: filters.status as any } : {}),
        ...(filters?.brokerId ? { brokerId: filters.brokerId } : {}),
      },
      include: {
        broker: true,
        booking: {
          include: {
            customer: true,
            unit: true,
            project: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getCommissionSummary(companyId: string) {
    const rows = await this.prisma.brokerCommission.findMany({
      where: { companyId },
      select: { status: true, commissionAmount: true, paidAmount: true },
    });

    const summary = {
      PENDING: 0,
      PAID: 0,
      CANCELLED: 0,
      pendingAmount: 0,
      paidAmount: 0,
      count: rows.length,
    };

    for (const r of rows) {
      summary[r.status] += 1;
      if (r.status === 'PENDING') summary.pendingAmount += r.commissionAmount;
      if (r.status === 'PAID')
        summary.paidAmount += r.paidAmount ?? r.commissionAmount;
    }
    return summary;
  }

  async markCommissionPaid(
    commissionId: string,
    companyId: string,
    data?: { paidAmount?: number; notes?: string; bankAccountId?: string },
  ) {
    const commission = await this.prisma.brokerCommission.findFirst({
      where: { id: commissionId, companyId },
      include: { broker: true, booking: true },
    });
    if (!commission) throw new NotFoundException('Commission not found');
    if (commission.status === 'CANCELLED') {
      throw new BadRequestException('Cannot pay a cancelled commission');
    }

    const paidAmount = data?.paidAmount ?? commission.commissionAmount;

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.brokerCommission.update({
        where: { id: commissionId },
        data: {
          status: 'PAID',
          paidAt: new Date(),
          paidAmount,
          notes: data?.notes ?? commission.notes,
        },
        include: { broker: true, booking: true },
      });

      if (data?.bankAccountId && paidAmount > 0) {
        await this.finance.postEntry(
          {
            companyId,
            bankAccountId: data.bankAccountId,
            type: CashbookEntryType.DEBIT,
            category: CashbookCategory.BROKER_COMMISSION,
            amount: paidAmount,
            description:
              data?.notes ||
              `Broker commission — ${commission.broker.name}`,
            projectId: commission.booking.projectId,
          },
          tx,
        );
      }

      return updated;
    });
  }
}
