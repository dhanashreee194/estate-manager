import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { FinanceService } from '../finance/finance.service';
import { CashbookCategory, CashbookEntryType } from '@prisma/client';

@Injectable()
export class VendorService {
  constructor(
    private prisma: PrismaService,
    private finance: FinanceService,
  ) {}

  create(dto: CreateVendorDto, companyId: string) {
    return this.prisma.vendor.create({
      data: {
        companyId,
        name: dto.name,
        phone: dto.phone,
        email: dto.email,
        gstNumber: dto.gstNumber,
        address: dto.address,
        type: dto.type || 'BOTH',
      },
    });
  }

  findAll(companyId: string, type?: string) {
    return this.prisma.vendor.findMany({
      where: {
        companyId,
        isActive: true,
        ...(type ? { type: type as any } : {}),
      },
      include: {
        _count: { select: { labours: true, inventoryInwards: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string, companyId: string) {
    const vendor = await this.prisma.vendor.findFirst({
      where: { id, companyId },
      include: {
        labours: true,
        expenses: { take: 20, orderBy: { date: 'desc' } },
        inventoryInwards: {
          take: 20,
          orderBy: { createdAt: 'desc' },
          include: { material: true, project: true },
        },
      },
    });
    if (!vendor) throw new NotFoundException('Vendor not found');
    return vendor;
  }

  async update(id: string, dto: UpdateVendorDto, companyId: string) {
    const vendor = await this.prisma.vendor.findFirst({
      where: { id, companyId },
    });
    if (!vendor) throw new NotFoundException('Vendor not found');

    return this.prisma.vendor.update({
      where: { id },
      data: {
        ...dto,
      },
    });
  }

  async deactivate(id: string, companyId: string) {
    const vendor = await this.prisma.vendor.findFirst({
      where: { id, companyId },
    });
    if (!vendor) throw new NotFoundException('Vendor not found');

    return this.prisma.vendor.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /** Record a payment / expense against a vendor */
  async recordPayment(
    vendorId: string,
    data: {
      projectId: string;
      amount: number;
      date: string;
      description?: string;
      gstRate?: number;
      type?: string;
      bankAccountId?: string;
    },
    companyId: string,
  ) {
    const vendor = await this.prisma.vendor.findFirst({
      where: { id: vendorId, companyId },
    });
    if (!vendor) throw new NotFoundException('Vendor not found');

    const project = await this.prisma.project.findFirst({
      where: { id: data.projectId, companyId },
    });
    if (!project) throw new BadRequestException('Invalid project');

    const gstRate = data.gstRate ?? 0;
    const gstAmount = gstRate ? (data.amount * gstRate) / 100 : 0;
    const totalAmount = data.amount + gstAmount;

    return this.prisma.$transaction(async (tx) => {
      const expense = await tx.expense.create({
        data: {
          projectId: data.projectId,
          type: data.type || 'VENDOR_PAYMENT',
          amount: totalAmount,
          date: new Date(data.date),
          description: data.description || `Payment to ${vendor.name}`,
          gstRate: gstRate || null,
          gstAmount: gstAmount || null,
          vendorGST: vendor.gstNumber,
          vendorId: vendor.id,
          bankAccountId: data.bankAccountId || null,
        },
        include: { vendor: true },
      });

      if (data.bankAccountId && totalAmount > 0) {
        await this.finance.postEntry(
          {
            companyId,
            bankAccountId: data.bankAccountId,
            type: CashbookEntryType.DEBIT,
            category: CashbookCategory.VENDOR_PAYMENT,
            amount: totalAmount,
            date: new Date(data.date),
            description: data.description || `Payment to ${vendor.name}`,
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
