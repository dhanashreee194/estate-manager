import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CashbookCategory,
  CashbookEntryType,
  LandAcquisitionType,
  LandParcelStatus,
  LandPartnerRole,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { FinanceService } from '../finance/finance.service';
import {
  AddParcelPartnerDto,
  CreateLandPartnerDto,
  UpdateLandPartnerDto,
} from './dto/land-partner.dto';
import {
  CreateLandParcelDto,
  CreateLandPaymentDto,
  UpdateLandParcelDto,
} from './dto/land-parcel.dto';

@Injectable()
export class LandService {
  constructor(
    private prisma: PrismaService,
    private finance: FinanceService,
  ) {}

  // ── Partners ───────────────────────────────────────────────────

  createPartner(dto: CreateLandPartnerDto, companyId: string) {
    return this.prisma.landPartner.create({
      data: {
        companyId,
        name: dto.name,
        phone: dto.phone,
        email: dto.email,
        panNumber: dto.panNumber,
        aadharNumber: dto.aadharNumber,
        address: dto.address,
        notes: dto.notes,
      },
    });
  }

  findPartners(companyId: string, activeOnly = true) {
    return this.prisma.landPartner.findMany({
      where: {
        companyId,
        ...(activeOnly ? { isActive: true } : {}),
      },
      include: {
        _count: { select: { shares: true, payments: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async updatePartner(
    id: string,
    dto: UpdateLandPartnerDto,
    companyId: string,
  ) {
    await this.getPartner(id, companyId);
    return this.prisma.landPartner.update({
      where: { id },
      data: dto,
    });
  }

  async deactivatePartner(id: string, companyId: string) {
    await this.getPartner(id, companyId);
    return this.prisma.landPartner.update({
      where: { id },
      data: { isActive: false },
    });
  }

  private async getPartner(id: string, companyId: string) {
    const partner = await this.prisma.landPartner.findFirst({
      where: { id, companyId },
    });
    if (!partner) throw new NotFoundException('Land partner not found');
    return partner;
  }

  // ── Parcels ────────────────────────────────────────────────────

  async createParcel(dto: CreateLandParcelDto, companyId: string) {
    if (dto.projectId) {
      await this.assertProject(dto.projectId, companyId);
    }

    return this.prisma.landParcel.create({
      data: {
        companyId,
        name: dto.name,
        projectId: dto.projectId || null,
        surveyNumber: dto.surveyNumber,
        gatNumber: dto.gatNumber,
        village: dto.village,
        taluka: dto.taluka,
        district: dto.district,
        areaSqFt: dto.areaSqFt,
        areaAcres: dto.areaAcres,
        acquisitionType: dto.acquisitionType || LandAcquisitionType.OUTRIGHT,
        status: dto.status || LandParcelStatus.PROSPECT,
        purchasePrice: dto.purchasePrice,
        agreementDate: dto.agreementDate
          ? new Date(dto.agreementDate)
          : null,
        registrationDate: dto.registrationDate
          ? new Date(dto.registrationDate)
          : null,
        notes: dto.notes,
      },
      include: this.parcelInclude(),
    });
  }

  findParcels(
    companyId: string,
    filters?: { status?: string; projectId?: string },
  ) {
    return this.prisma.landParcel.findMany({
      where: {
        companyId,
        ...(filters?.status
          ? { status: filters.status as LandParcelStatus }
          : {}),
        ...(filters?.projectId ? { projectId: filters.projectId } : {}),
      },
      include: this.parcelInclude(),
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findParcel(id: string, companyId: string) {
    const parcel = await this.prisma.landParcel.findFirst({
      where: { id, companyId },
      include: {
        ...this.parcelInclude(),
        payments: {
          include: { partner: true, bankAccount: true },
          orderBy: { date: 'desc' },
        },
      },
    });
    if (!parcel) throw new NotFoundException('Land parcel not found');
    return parcel;
  }

  async updateParcel(id: string, dto: UpdateLandParcelDto, companyId: string) {
    await this.findParcel(id, companyId);
    if (dto.projectId) {
      await this.assertProject(dto.projectId, companyId);
    }

    const status =
      dto.projectId && !dto.status
        ? LandParcelStatus.LINKED_TO_PROJECT
        : dto.status;

    return this.prisma.landParcel.update({
      where: { id },
      data: {
        name: dto.name,
        projectId: dto.projectId === undefined ? undefined : dto.projectId,
        surveyNumber: dto.surveyNumber,
        gatNumber: dto.gatNumber,
        village: dto.village,
        taluka: dto.taluka,
        district: dto.district,
        areaSqFt: dto.areaSqFt,
        areaAcres: dto.areaAcres,
        acquisitionType: dto.acquisitionType,
        status,
        purchasePrice: dto.purchasePrice,
        agreementDate:
          dto.agreementDate === undefined
            ? undefined
            : dto.agreementDate
              ? new Date(dto.agreementDate)
              : null,
        registrationDate:
          dto.registrationDate === undefined
            ? undefined
            : dto.registrationDate
              ? new Date(dto.registrationDate)
              : null,
        notes: dto.notes,
      },
      include: this.parcelInclude(),
    });
  }

  async addParcelPartner(
    parcelId: string,
    dto: AddParcelPartnerDto,
    companyId: string,
  ) {
    await this.findParcel(parcelId, companyId);
    await this.getPartner(dto.partnerId, companyId);

    if (dto.sharePercent != null && (dto.sharePercent < 0 || dto.sharePercent > 100)) {
      throw new BadRequestException('Share % must be 0–100');
    }

    return this.prisma.landParcelPartner.create({
      data: {
        landParcelId: parcelId,
        partnerId: dto.partnerId,
        role: dto.role || LandPartnerRole.LANDOWNER,
        sharePercent: dto.sharePercent,
        landShareSqFt: dto.landShareSqFt,
        notes: dto.notes,
      },
      include: { partner: true },
    });
  }

  async removeParcelPartner(
    parcelId: string,
    shareId: string,
    companyId: string,
  ) {
    await this.findParcel(parcelId, companyId);
    const share = await this.prisma.landParcelPartner.findFirst({
      where: { id: shareId, landParcelId: parcelId },
    });
    if (!share) throw new NotFoundException('Partner share not found');
    return this.prisma.landParcelPartner.delete({ where: { id: shareId } });
  }

  // ── Payments ───────────────────────────────────────────────────

  async createPayment(dto: CreateLandPaymentDto, companyId: string) {
    const parcel = await this.findParcel(dto.landParcelId, companyId);
    if (dto.partnerId) {
      await this.getPartner(dto.partnerId, companyId);
    }
    const amount = Number(dto.amount);
    if (amount <= 0) throw new BadRequestException('Amount must be positive');

    const date = dto.date ? new Date(dto.date) : new Date();
    const isJv =
      parcel.acquisitionType === LandAcquisitionType.JV ||
      parcel.acquisitionType === LandAcquisitionType.DEVELOPMENT_AGREEMENT;

    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.landParcelPayment.create({
        data: {
          companyId,
          landParcelId: dto.landParcelId,
          partnerId: dto.partnerId || null,
          amount,
          date,
          description: dto.description,
          reference: dto.reference,
          bankAccountId: dto.bankAccountId || null,
        },
        include: { partner: true, parcel: true, bankAccount: true },
      });

      if (dto.bankAccountId) {
        await this.finance.postEntry(
          {
            companyId,
            bankAccountId: dto.bankAccountId,
            type: CashbookEntryType.DEBIT,
            category: isJv
              ? CashbookCategory.JV_PAYOUT
              : CashbookCategory.LAND_PURCHASE,
            amount,
            date,
            description:
              dto.description ||
              `Land ${isJv ? 'JV payout' : 'purchase'} — ${parcel.name}`,
            reference: dto.reference,
            projectId: parcel.projectId || undefined,
          },
          tx,
        );
      }

      return payment;
    });
  }

  findPayments(
    companyId: string,
    filters?: { landParcelId?: string; partnerId?: string },
  ) {
    return this.prisma.landParcelPayment.findMany({
      where: {
        companyId,
        ...(filters?.landParcelId
          ? { landParcelId: filters.landParcelId }
          : {}),
        ...(filters?.partnerId ? { partnerId: filters.partnerId } : {}),
      },
      include: {
        parcel: true,
        partner: true,
        bankAccount: true,
      },
      orderBy: { date: 'desc' },
      take: 200,
    });
  }

  async getSummary(companyId: string) {
    const parcels = await this.prisma.landParcel.findMany({
      where: { companyId, status: { not: 'CANCELLED' } },
      include: {
        payments: true,
        partners: true,
      },
    });

    const payments = await this.prisma.landParcelPayment.findMany({
      where: { companyId },
    });

    const totalPurchase = parcels.reduce(
      (s, p) => s + (p.purchasePrice || 0),
      0,
    );
    const totalPaid = payments.reduce((s, p) => s + p.amount, 0);
    const byStatus = parcels.reduce(
      (acc, p) => {
        acc[p.status] = (acc[p.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
    const jvCount = parcels.filter(
      (p) =>
        p.acquisitionType === 'JV' ||
        p.acquisitionType === 'DEVELOPMENT_AGREEMENT',
    ).length;

    return {
      parcelCount: parcels.length,
      partnerLinks: parcels.reduce((s, p) => s + p.partners.length, 0),
      totalPurchase,
      totalPaid,
      balance: totalPurchase - totalPaid,
      jvCount,
      byStatus,
    };
  }

  private parcelInclude() {
    return {
      project: { select: { id: true, name: true } },
      partners: { include: { partner: true } },
      _count: { select: { payments: true } },
    };
  }

  private async assertProject(projectId: string, companyId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, companyId },
    });
    if (!project) throw new BadRequestException('Invalid project');
    return project;
  }
}
