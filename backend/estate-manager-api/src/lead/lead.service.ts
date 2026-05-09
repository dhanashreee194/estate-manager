import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { LeadStatus } from '@prisma/client';

@Injectable()
export class LeadService {
  constructor(private prisma: PrismaService) {}

  // ✅ CREATE LEAD
  async create(dto: CreateLeadDto, companyId: string) {
    return this.prisma.lead.create({
      data: {
        ...dto,
        companyId,
      },
    });
  }

  // ✅ GET ALL LEADS (Company Safe)
  async findAll(companyId: string) {
    return this.prisma.lead.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      include: {
        assignedTo: true,
        project: true,
      },
    });
  }

  // ✅ GET SINGLE LEAD
  async findOne(id: string, companyId: string) {
    const lead = await this.prisma.lead.findFirst({
      where: { id, companyId },
      include: {
        assignedTo: true,
        project: true,
      },
    });

    if (!lead) {
      throw new BadRequestException('Lead not found');
    }

    return lead;
  }

  // ✅ UPDATE FULL LEAD
  async update(id: string, dto: UpdateLeadDto, companyId: string) {
    await this.findOne(id, companyId);

    return this.prisma.lead.update({
      where: { id },
      data: dto,
    });
  }

  // ✅ UPDATE ONLY STATUS
  async updateStatus(id: string, status: LeadStatus, companyId: string) {
    await this.findOne(id, companyId);

    return this.prisma.lead.update({
      where: { id },
      data: { status },
    });
  }

  // ✅ DELETE LEAD
  async remove(id: string, companyId: string) {
    await this.findOne(id, companyId);

    return this.prisma.lead.delete({
      where: { id },
    });
  }

  async getKanban(companyId: string) {
    const leads = await this.prisma.lead.findMany({
      where: { companyId },
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
}
