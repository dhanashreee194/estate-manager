import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DailyReportService {
  constructor(private prisma: PrismaService) {}

  async createReport(
    projectId: string,
    date: Date,
    workDetails: string,
    extra?: {
      siteName?: string;
      meterFrom?: number | null;
      meterTo?: number | null;
      meterUnits?: number | null;
      checkedBy?: string;
    },
  ) {
    return this.prisma.dailyReport.create({
      data: {
        projectId,
        date,
        workDetails,
        siteName: extra?.siteName || null,
        meterFrom: extra?.meterFrom ?? null,
        meterTo: extra?.meterTo ?? null,
        meterUnits: extra?.meterUnits ?? null,
        checkedBy: extra?.checkedBy || null,
      },
      include: {
        labours: true,
        materials: true,
        payments: true,
        goods: true,
      },
    });
  }

  async getProjectReports(projectId: string) {
    return this.prisma.dailyReport.findMany({
      where: { projectId },
      include: {
        labours: { include: { vendor: true } },
        materials: true,
        payments: { include: { vendor: true } },
        goods: { include: { vendor: true } },
      },
      orderBy: { date: 'desc' },
    });
  }

  async addLabour(reportId: string, data: any) {
    const agencyName = await this.resolveAgencyName(data);
    const skilled = Number(data.skilled || 0);
    const men = Number(data.men || 0);
    const women = Number(data.women || 0);

    return this.prisma.dailyLabour.create({
      data: {
        reportId,
        vendorId: data.vendorId || null,
        agency: agencyName,
        skilled,
        men,
        women,
        total: skilled + men + women,
      },
      include: { vendor: true },
    });
  }

  async addMaterial(reportId: string, data: any) {
    const stock = Number(data.stock || 0);
    const consumed = Number(data.consumed || 0);
    const materialName =
      data.material ||
      data.name ||
      (await this.resolveMaterialName(data.materialId));

    return this.prisma.dailyMaterial.create({
      data: {
        reportId,
        materialId: data.materialId || null,
        material: materialName || '',
        size: data.size || null,
        stock,
        consumed,
        balance: stock - consumed,
      },
    });
  }

  async addPayment(reportId: string, data: any) {
    const party =
      data.party || (await this.resolveVendorName(data.vendorId)) || '';

    return this.prisma.dailyPayment.create({
      data: {
        reportId,
        party,
        amount: Number(data.amount || 0),
        vendorId: data.vendorId || null,
      },
      include: { vendor: true },
    });
  }

  async addGoods(reportId: string, data: any) {
    const materialName =
      data.material || (await this.resolveMaterialName(data.materialId)) || '';

    return this.prisma.dailyGoods.create({
      data: {
        reportId,
        material: materialName,
        materialId: data.materialId || null,
        quantity: Number(data.quantity || 0),
        remarks: data.remarks || null,
        vendorId: data.vendorId || null,
      },
      include: { vendor: true },
    });
  }

  /**
   * Full daily sheet save — replaces labour/material/payment/goods rows.
   * Optional syncs: inventory outward (cement/steel), goods inward,
   * agency attendance, vendor payment expenses.
   */
  async saveSheet(
    reportId: string,
    body: {
      date?: string;
      workDetails?: string;
      siteName?: string;
      meterFrom?: number | null;
      meterTo?: number | null;
      meterUnits?: number | null;
      checkedBy?: string;
      labours?: any[];
      materials?: any[];
      payments?: any[];
      goods?: any[];
      syncInventory?: boolean;
      syncGoods?: boolean;
      syncAttendance?: boolean;
      syncVendorPayments?: boolean;
    },
  ) {
    const report = await this.prisma.dailyReport.findUnique({
      where: { id: reportId },
    });
    if (!report) throw new BadRequestException('Report not found');

    const reportDate = body.date ? new Date(body.date) : report.date;

    await this.prisma.dailyReport.update({
      where: { id: reportId },
      data: {
        ...(body.date ? { date: reportDate } : {}),
        ...(body.workDetails !== undefined
          ? { workDetails: body.workDetails }
          : {}),
        ...(body.siteName !== undefined ? { siteName: body.siteName } : {}),
        ...(body.meterFrom !== undefined ? { meterFrom: body.meterFrom } : {}),
        ...(body.meterTo !== undefined ? { meterTo: body.meterTo } : {}),
        ...(body.meterUnits !== undefined
          ? { meterUnits: body.meterUnits }
          : {}),
        ...(body.checkedBy !== undefined ? { checkedBy: body.checkedBy } : {}),
      },
    });

    await this.prisma.dailyLabour.deleteMany({ where: { reportId } });
    await this.prisma.dailyMaterial.deleteMany({ where: { reportId } });
    await this.prisma.dailyPayment.deleteMany({ where: { reportId } });
    await this.prisma.dailyGoods.deleteMany({ where: { reportId } });

    const labourRows = body.labours || [];
    for (const row of labourRows) {
      if (!row.agency && !row.vendorId && !row.skilled && !row.men && !row.women)
        continue;
      const labour = await this.addLabour(reportId, row);

      if (body.syncAttendance && labour.vendorId && labour.total > 0) {
        await this.syncAgencyAttendance(
          report.projectId,
          labour.vendorId,
          reportDate,
          labour.total,
          labour.agency,
        );
      }
    }

    const materialRows = body.materials || [];
    for (const row of materialRows) {
      if (
        !row.material &&
        !row.name &&
        !row.materialId &&
        !row.consumed &&
        !row.stock &&
        !row.size
      )
        continue;
      const created = await this.addMaterial(reportId, row);

      if (body.syncInventory && created.materialId && created.consumed > 0) {
        await this.syncMaterialOutward(
          report.projectId,
          created.materialId,
          created.consumed,
          reportDate,
          reportId,
        );
      }
    }

    const paymentRows = body.payments || [];
    for (const row of paymentRows) {
      if (!row.party && !row.vendorId && !row.amount) continue;
      const payment = await this.addPayment(reportId, row);

      if (body.syncVendorPayments && payment.amount > 0) {
        await this.syncVendorPaymentExpense(
          report.projectId,
          payment,
          reportDate,
          reportId,
        );
      }
    }

    const goodsRows = body.goods || [];
    for (const row of goodsRows) {
      if (!row.material && !row.materialId && !row.quantity) continue;
      const goods = await this.addGoods(reportId, row);

      if (body.syncGoods && goods.materialId && goods.quantity > 0) {
        await this.syncGoodsInward(
          report.projectId,
          goods.materialId,
          goods.quantity,
          goods.vendorId,
          goods.remarks,
          reportDate,
          reportId,
        );
      }
    }

    return this.getReportById(reportId);
  }

  /** Mark assigned labours under agency vendor present (up to headcount). */
  private async syncAgencyAttendance(
    projectId: string,
    vendorId: string,
    date: Date,
    headcount: number,
    agencyName: string,
  ) {
    const day = new Date(date);
    day.setHours(0, 0, 0, 0);

    const assigned = await this.prisma.labourAssignment.findMany({
      where: {
        projectId,
        endDate: null,
        labour: { vendorId },
      },
      include: { labour: true },
      orderBy: { startDate: 'asc' },
    });

    const toMark = assigned.slice(0, Math.max(headcount, 0));

    for (const a of toMark) {
      const labour = a.labour;
      const attendance = await this.prisma.labourAttendance.upsert({
        where: {
          labourId_projectId_date: {
            labourId: labour.id,
            projectId,
            date: day,
          },
        },
        update: {
          present: true,
          wageForDay: labour.dailyWage,
        },
        create: {
          labourId: labour.id,
          projectId,
          date: day,
          present: true,
          wageForDay: labour.dailyWage,
        },
      });

      if (!attendance.expenseId) {
        const expense = await this.prisma.expense.create({
          data: {
            projectId,
            type: 'LABOUR',
            amount: labour.dailyWage,
            date: day,
            description: `Daily sheet attendance — ${agencyName} / ${labour.name}`,
            vendorId,
          },
        });
        await this.prisma.labourAttendance.update({
          where: { id: attendance.id },
          data: { expenseId: expense.id },
        });
      }
    }

    // If headcount exceeds registered workers, post agency summary expense once
    if (headcount > assigned.length) {
      const extra = headcount - assigned.length;
      const tag = `Daily sheet agency extra — ${agencyName} (${reportTag(day, projectId)})`;
      const existing = await this.prisma.expense.findFirst({
        where: { projectId, type: 'LABOUR', description: tag },
      });
      if (!existing) {
        await this.prisma.expense.create({
          data: {
            projectId,
            type: 'LABOUR',
            amount: 0,
            date: day,
            description: `${tag} · ${extra} unregistered workers noted on sheet`,
            vendorId,
          },
        });
      }
    }
  }

  private async syncMaterialOutward(
    projectId: string,
    materialId: string,
    quantity: number,
    reportDate: Date,
    reportId: string,
  ) {
    const tag = `Daily sheet consumption · ${reportId}`;
    const already = await this.prisma.expense.findFirst({
      where: {
        projectId,
        type: 'MATERIAL',
        description: tag,
        inventory: { materialId },
      },
    });
    if (already) return; // idempotent on re-save

    const inventory = await this.prisma.inventory.findFirst({
      where: { projectId, materialId },
      include: { material: true },
    });

    if (!inventory || inventory.quantity < quantity) {
      throw new BadRequestException(
        `Insufficient stock for ${inventory?.material?.name || materialId}`,
      );
    }

    await this.prisma.inventory.update({
      where: { id: inventory.id },
      data: { quantity: { decrement: quantity } },
    });

    await this.prisma.inventoryOutward.create({
      data: { projectId, materialId, quantity },
    });

    await this.prisma.expense.create({
      data: {
        projectId,
        type: 'MATERIAL',
        amount: quantity * (inventory.material.unitCost || 0),
        date: reportDate,
        inventoryId: inventory.id,
        description: tag,
      },
    });
  }

  private async syncGoodsInward(
    projectId: string,
    materialId: string,
    quantity: number,
    vendorId: string | null,
    remarks: string | null,
    reportDate: Date,
    reportId: string,
  ) {
    const invoiceNo = `DS-${reportId.slice(0, 8)}`;
    const already = await this.prisma.inventoryInward.findFirst({
      where: {
        projectId,
        materialId,
        invoiceNo,
        quantity,
      },
    });
    if (already) return;

    await this.prisma.inventory.upsert({
      where: {
        projectId_materialId: { projectId, materialId },
      },
      update: { quantity: { increment: quantity } },
      create: { projectId, materialId, quantity },
    });

    await this.prisma.inventoryInward.create({
      data: {
        projectId,
        materialId,
        quantity,
        vendorId: vendorId || null,
        remarks: remarks || `Daily sheet goods · ${reportId}`,
        invoiceNo,
      },
    });

    // note: reportDate kept for future cost posting; inward uses createdAt
    void reportDate;
  }

  private async syncVendorPaymentExpense(
    projectId: string,
    payment: { party: string; amount: number; vendorId: string | null },
    reportDate: Date,
    reportId: string,
  ) {
    const description = `Daily sheet payment — ${payment.party} · ${reportId}`;
    const existing = await this.prisma.expense.findFirst({
      where: { projectId, type: 'VENDOR_PAYMENT', description },
    });
    if (existing) return;

    await this.prisma.expense.create({
      data: {
        projectId,
        type: 'VENDOR_PAYMENT',
        amount: payment.amount,
        date: reportDate,
        description,
        vendorId: payment.vendorId,
      },
    });
  }

  private async resolveAgencyName(data: any) {
    if (data.agency) return data.agency;
    if (data.vendorId) {
      const vendor = await this.prisma.vendor.findUnique({
        where: { id: data.vendorId },
      });
      return vendor?.name || '';
    }
    return '';
  }

  private async resolveVendorName(vendorId?: string) {
    if (!vendorId) return '';
    const vendor = await this.prisma.vendor.findUnique({
      where: { id: vendorId },
    });
    return vendor?.name || '';
  }

  private async resolveMaterialName(materialId?: string) {
    if (!materialId) return '';
    const material = await this.prisma.material.findUnique({
      where: { id: materialId },
    });
    return material?.name || '';
  }

  async updateReport(id: string, body: any) {
    return this.prisma.dailyReport.update({
      where: { id },
      data: {
        date: new Date(body.date),
        workDetails: body.workDetails,
        siteName: body.siteName ?? undefined,
        meterFrom: body.meterFrom ?? undefined,
        meterTo: body.meterTo ?? undefined,
        meterUnits: body.meterUnits ?? undefined,
        checkedBy: body.checkedBy ?? undefined,
      },
    });
  }

  async getReportById(id: string) {
    return this.prisma.dailyReport.findUnique({
      where: { id },
      include: {
        labours: { include: { vendor: true } },
        materials: true,
        payments: { include: { vendor: true } },
        goods: { include: { vendor: true } },
      },
    });
  }
}

function reportTag(day: Date, projectId: string) {
  return `${day.toISOString().slice(0, 10)}:${projectId.slice(0, 8)}`;
}
