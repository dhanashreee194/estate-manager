import { randomUUID } from 'crypto';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  BankAccountType,
  CashbookCategory,
  CashbookEntryType,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { UpdateBankAccountDto } from './dto/update-bank-account.dto';
import { CreateCashbookEntryDto } from './dto/create-cashbook-entry.dto';
import { TransferDto } from './dto/transfer.dto';

@Injectable()
export class FinanceService {
  constructor(private prisma: PrismaService) {}

  // ─── Bank accounts ─────────────────────────────────────────────

  async createAccount(dto: CreateBankAccountDto, companyId: string) {
    const opening = Number(dto.openingBalance || 0);

    return this.prisma.$transaction(async (tx) => {
      if (dto.isDefault) {
        await tx.bankAccount.updateMany({
          where: { companyId, isDefault: true },
          data: { isDefault: false },
        });
      }

      const account = await tx.bankAccount.create({
        data: {
          companyId,
          name: dto.name,
          accountType: dto.accountType || BankAccountType.BANK,
          bankName: dto.bankName,
          accountNumber: dto.accountNumber,
          ifsc: dto.ifsc,
          openingBalance: opening,
          balance: opening,
          isDefault: dto.isDefault ?? false,
          notes: dto.notes,
        },
      });

      if (opening !== 0) {
        await tx.cashbookEntry.create({
          data: {
            companyId,
            bankAccountId: account.id,
            type: opening >= 0 ? CashbookEntryType.CREDIT : CashbookEntryType.DEBIT,
            category: CashbookCategory.OPENING,
            amount: Math.abs(opening),
            balanceAfter: opening,
            date: new Date(),
            description: 'Opening balance',
          },
        });
      }

      return account;
    });
  }

  findAccounts(companyId: string, all = false) {
    return this.prisma.bankAccount.findMany({
      where: {
        companyId,
        ...(all ? {} : { isActive: true }),
      },
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
    });
  }

  async findAccount(id: string, companyId: string) {
    const account = await this.prisma.bankAccount.findFirst({
      where: { id, companyId },
    });
    if (!account) throw new NotFoundException('Bank account not found');
    return account;
  }

  async updateAccount(
    id: string,
    dto: UpdateBankAccountDto,
    companyId: string,
  ) {
    await this.findAccount(id, companyId);

    return this.prisma.$transaction(async (tx) => {
      if (dto.isDefault) {
        await tx.bankAccount.updateMany({
          where: { companyId, isDefault: true, NOT: { id } },
          data: { isDefault: false },
        });
      }

      return tx.bankAccount.update({
        where: { id },
        data: {
          name: dto.name,
          accountType: dto.accountType,
          bankName: dto.bankName,
          accountNumber: dto.accountNumber,
          ifsc: dto.ifsc,
          isDefault: dto.isDefault,
          isActive: dto.isActive,
          notes: dto.notes,
        },
      });
    });
  }

  async deactivateAccount(id: string, companyId: string) {
    await this.findAccount(id, companyId);
    return this.prisma.bankAccount.update({
      where: { id },
      data: { isActive: false, isDefault: false },
    });
  }

  async getSummary(companyId: string) {
    const accounts = await this.findAccounts(companyId);
    const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);
    const byType = accounts.reduce(
      (acc, a) => {
        acc[a.accountType] = (acc[a.accountType] || 0) + a.balance;
        return acc;
      },
      {} as Record<string, number>,
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const todayEntries = await this.prisma.cashbookEntry.findMany({
      where: {
        companyId,
        date: { gte: today, lt: tomorrow },
        category: { not: CashbookCategory.OPENING },
      },
    });

    const todayIn = todayEntries
      .filter((e) => e.type === 'CREDIT')
      .reduce((s, e) => s + e.amount, 0);
    const todayOut = todayEntries
      .filter((e) => e.type === 'DEBIT')
      .reduce((s, e) => s + e.amount, 0);

    return {
      totalBalance,
      accountCount: accounts.length,
      byType,
      todayIn,
      todayOut,
      accounts,
    };
  }

  // ─── Cashbook ──────────────────────────────────────────────────

  async getCashbook(
    companyId: string,
    filters?: {
      bankAccountId?: string;
      projectId?: string;
      type?: CashbookEntryType;
      category?: CashbookCategory;
      from?: string;
      to?: string;
    },
  ) {
    const where: Prisma.CashbookEntryWhereInput = {
      companyId,
      ...(filters?.bankAccountId
        ? { bankAccountId: filters.bankAccountId }
        : {}),
      ...(filters?.projectId ? { projectId: filters.projectId } : {}),
      ...(filters?.type ? { type: filters.type } : {}),
      ...(filters?.category ? { category: filters.category } : {}),
      ...(filters?.from || filters?.to
        ? {
            date: {
              ...(filters.from ? { gte: new Date(filters.from) } : {}),
              ...(filters.to ? { lte: new Date(filters.to) } : {}),
            },
          }
        : {}),
    };

    const entries = await this.prisma.cashbookEntry.findMany({
      where,
      include: {
        bankAccount: true,
        project: { select: { id: true, name: true } },
      },
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
      take: 500,
    });

    const credits = entries
      .filter((e) => e.type === 'CREDIT')
      .reduce((s, e) => s + e.amount, 0);
    const debits = entries
      .filter((e) => e.type === 'DEBIT')
      .reduce((s, e) => s + e.amount, 0);

    return {
      entries,
      totals: { credits, debits, net: credits - debits },
    };
  }

  /** Manual credit/debit entry */
  async createEntry(dto: CreateCashbookEntryDto, companyId: string) {
    return this.postEntry(
      {
        companyId,
        bankAccountId: dto.bankAccountId,
        type: dto.type,
        category: dto.category || CashbookCategory.OTHER,
        amount: Number(dto.amount),
        date: dto.date ? new Date(dto.date) : new Date(),
        description: dto.description,
        reference: dto.reference,
        projectId: dto.projectId,
      },
      this.prisma,
    );
  }

  /** Transfer between two accounts */
  async transfer(dto: TransferDto, companyId: string) {
    if (dto.fromAccountId === dto.toAccountId) {
      throw new BadRequestException('Cannot transfer to the same account');
    }
    const amount = Number(dto.amount);
    if (amount <= 0) throw new BadRequestException('Amount must be positive');

    const from = await this.findAccount(dto.fromAccountId, companyId);
    const to = await this.findAccount(dto.toAccountId, companyId);
    if (!from.isActive || !to.isActive) {
      throw new BadRequestException('Both accounts must be active');
    }

    const groupId = randomUUID();
    const date = dto.date ? new Date(dto.date) : new Date();
    const note = dto.description || `Transfer: ${from.name} → ${to.name}`;

    return this.prisma.$transaction(async (tx) => {
      const out = await this.postEntry(
        {
          companyId,
          bankAccountId: from.id,
          type: CashbookEntryType.DEBIT,
          category: CashbookCategory.TRANSFER,
          amount,
          date,
          description: note,
          reference: dto.reference,
          transferGroupId: groupId,
        },
        tx,
      );
      const inn = await this.postEntry(
        {
          companyId,
          bankAccountId: to.id,
          type: CashbookEntryType.CREDIT,
          category: CashbookCategory.TRANSFER,
          amount,
          date,
          description: note,
          reference: dto.reference,
          transferGroupId: groupId,
        },
        tx,
      );
      return { transferGroupId: groupId, debit: out, credit: inn };
    });
  }

  /**
   * Shared poster used by finance UI and payment/expense/broker hooks.
   * Pass PrismaService or transaction client.
   */
  async postEntry(
    data: {
      companyId: string;
      bankAccountId: string;
      type: CashbookEntryType;
      category: CashbookCategory;
      amount: number;
      date?: Date;
      description?: string;
      reference?: string;
      projectId?: string;
      paymentId?: string;
      expenseId?: string;
      transferGroupId?: string;
    },
    db: PrismaService | Prisma.TransactionClient = this.prisma,
  ) {
    if (!data.amount || data.amount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }

    const account = await db.bankAccount.findFirst({
      where: { id: data.bankAccountId, companyId: data.companyId },
    });
    if (!account) throw new NotFoundException('Bank account not found');
    if (!account.isActive) {
      throw new BadRequestException('Bank account is inactive');
    }

    const delta =
      data.type === CashbookEntryType.CREDIT ? data.amount : -data.amount;
    const balanceAfter = account.balance + delta;

    const entry = await db.cashbookEntry.create({
      data: {
        companyId: data.companyId,
        bankAccountId: data.bankAccountId,
        type: data.type,
        category: data.category,
        amount: data.amount,
        balanceAfter,
        date: data.date || new Date(),
        description: data.description,
        reference: data.reference,
        projectId: data.projectId,
        paymentId: data.paymentId,
        expenseId: data.expenseId,
        transferGroupId: data.transferGroupId,
      },
      include: { bankAccount: true },
    });

    await db.bankAccount.update({
      where: { id: data.bankAccountId },
      data: { balance: balanceAfter },
    });

    return entry;
  }
}
