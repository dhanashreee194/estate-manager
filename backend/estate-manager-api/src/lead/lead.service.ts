import {
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { LeadSource, LeadStatus } from '@prisma/client';

@Injectable()
export class LeadService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateLeadDto, companyId: string) {
    return this.prisma.lead.create({
      data: {
        name: dto.name,
        phone: dto.phone,
        email: dto.email,
        source: dto.source || 'OTHER',
        sourceDetail: dto.sourceDetail,
        portalListingId: dto.portalListingId,
        portalUrl: dto.portalUrl,
        referredBy: dto.referredBy,
        budget: dto.budget,
        requirement: dto.requirement,
        projectId: dto.projectId,
        assignedToId: dto.assignedToId,
        nextFollowUp: dto.nextFollowUp,
        remarks: dto.remarks,
        companyId,
      },
      include: { assignedTo: true, project: true, unit: true, campaign: true },
    });
  }

  async findAll(
    companyId: string,
    filters?: { source?: LeadSource; projectId?: string; status?: LeadStatus },
  ) {
    return this.prisma.lead.findMany({
      where: {
        companyId,
        ...(filters?.source ? { source: filters.source } : {}),
        ...(filters?.projectId ? { projectId: filters.projectId } : {}),
        ...(filters?.status ? { status: filters.status } : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        assignedTo: true,
        project: true,
        unit: true,
        campaign: { select: { id: true, title: true, code: true } },
      },
    });
  }

  async findOne(id: string, companyId: string) {
    const lead = await this.prisma.lead.findFirst({
      where: { id, companyId },
      include: {
        assignedTo: true,
        project: true,
        unit: true,
        campaign: { select: { id: true, title: true, code: true } },
      },
    });

    if (!lead) {
      throw new BadRequestException('Lead not found');
    }

    return lead;
  }

  async update(id: string, dto: UpdateLeadDto, companyId: string) {
    await this.findOne(id, companyId);

    return this.prisma.lead.update({
      where: { id },
      data: dto,
      include: { assignedTo: true, project: true, unit: true, campaign: true },
    });
  }

  async updateStatus(id: string, status: LeadStatus, companyId: string) {
    await this.findOne(id, companyId);

    return this.prisma.lead.update({
      where: { id },
      data: { status },
    });
  }

  async remove(id: string, companyId: string) {
    await this.findOne(id, companyId);

    return this.prisma.lead.delete({
      where: { id },
    });
  }

  async getKanban(
    companyId: string,
    filters?: { source?: LeadSource; projectId?: string },
  ) {
    const leads = await this.prisma.lead.findMany({
      where: {
        companyId,
        ...(filters?.source ? { source: filters.source } : {}),
        ...(filters?.projectId ? { projectId: filters.projectId } : {}),
      },
      include: { project: true, assignedTo: true, unit: true, campaign: true },
      orderBy: { createdAt: 'desc' },
    });

    return {
      NEW: leads.filter((l) => l.status === 'NEW'),
      FOLLOW_UP: leads.filter((l) => l.status === 'FOLLOW_UP'),
      VISIT_SCHEDULED: leads.filter((l) => l.status === 'VISIT_SCHEDULED'),
      NEGOTIATION: leads.filter((l) => l.status === 'NEGOTIATION'),
      CONVERTED: leads.filter((l) => l.status === 'CONVERTED'),
      LOST: leads.filter((l) => l.status === 'LOST'),
    };
  }

  /** Counts by portal/source for CRM dashboard strip */
  async getSourceSummary(companyId: string, projectId?: string) {
    const grouped = await this.prisma.lead.groupBy({
      by: ['source'],
      where: {
        companyId,
        ...(projectId ? { projectId } : {}),
      },
      _count: { _all: true },
    });

    const byStatus = await this.prisma.lead.groupBy({
      by: ['source', 'status'],
      where: {
        companyId,
        ...(projectId ? { projectId } : {}),
      },
      _count: { _all: true },
    });

    const sources = Object.values(LeadSource);
    const summary = sources.map((source) => {
      const row = grouped.find((g) => g.source === source);
      const converted =
        byStatus.find((g) => g.source === source && g.status === 'CONVERTED')
          ?._count._all || 0;
      const total = row?._count._all || 0;
      return {
        source,
        total,
        converted,
        conversionRate: total ? Math.round((converted / total) * 1000) / 10 : 0,
      };
    });

    return {
      total: summary.reduce((s, r) => s + r.total, 0),
      sources: summary.filter((s) => s.total > 0).sort((a, b) => b.total - a.total),
      allSources: summary,
    };
  }
}
