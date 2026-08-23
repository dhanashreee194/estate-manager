import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  InstallmentStatus,
  Prisma,
  ReminderChannel,
  ReminderStatus,
  ReminderType,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateReminderDto,
  MarkReminderDto,
  UpdateReminderDto,
} from './dto/reminder.dto';

@Injectable()
export class ReminderService {
  constructor(private prisma: PrismaService) {}

  async list(
    companyId: string,
    filters?: {
      status?: string;
      type?: string;
      dueOnly?: boolean;
    },
  ) {
    const todayEnd = endOfDay(new Date());
    const where: Prisma.ReminderWhereInput = {
      companyId,
      ...(filters?.status
        ? { status: filters.status as ReminderStatus }
        : { status: { in: [ReminderStatus.PENDING, ReminderStatus.SENT] } }),
      ...(filters?.type ? { type: filters.type as ReminderType } : {}),
      ...(filters?.dueOnly ? { dueAt: { lte: todayEnd } } : {}),
    };

    return this.prisma.reminder.findMany({
      where,
      orderBy: [{ dueAt: 'asc' }, { createdAt: 'desc' }],
      take: 300,
    });
  }

  async summary(companyId: string) {
    const todayEnd = endOfDay(new Date());
    const todayStart = startOfDay(new Date());

    const [pending, dueToday, overdue, leadsDue, installmentsDue] =
      await Promise.all([
        this.prisma.reminder.count({
          where: { companyId, status: ReminderStatus.PENDING },
        }),
        this.prisma.reminder.count({
          where: {
            companyId,
            status: ReminderStatus.PENDING,
            dueAt: { gte: todayStart, lte: todayEnd },
          },
        }),
        this.prisma.reminder.count({
          where: {
            companyId,
            status: ReminderStatus.PENDING,
            dueAt: { lt: todayStart },
          },
        }),
        this.prisma.reminder.count({
          where: {
            companyId,
            status: ReminderStatus.PENDING,
            type: ReminderType.LEAD_FOLLOW_UP,
          },
        }),
        this.prisma.reminder.count({
          where: {
            companyId,
            status: ReminderStatus.PENDING,
            type: {
              in: [
                ReminderType.INSTALLMENT_DUE,
                ReminderType.INSTALLMENT_OVERDUE,
              ],
            },
          },
        }),
      ]);

    return { pending, dueToday, overdue, leadsDue, installmentsDue };
  }

  create(dto: CreateReminderDto, companyId: string, userId?: string) {
    return this.prisma.reminder.create({
      data: {
        companyId,
        type: dto.type,
        title: dto.title,
        message: dto.message,
        phone: normalizePhone(dto.phone),
        dueAt: new Date(dto.dueAt),
        channel: dto.channel || ReminderChannel.IN_APP,
        entityType: dto.entityType || 'Manual',
        entityId: dto.entityId,
        createdById: userId,
      },
    });
  }

  async update(id: string, dto: UpdateReminderDto, companyId: string) {
    await this.getOne(id, companyId);
    return this.prisma.reminder.update({
      where: { id },
      data: {
        title: dto.title,
        message: dto.message,
        phone: dto.phone !== undefined ? normalizePhone(dto.phone) : undefined,
        dueAt: dto.dueAt ? new Date(dto.dueAt) : undefined,
        channel: dto.channel,
        status: dto.status,
      },
    });
  }

  async compose(id: string, companyId: string) {
    const reminder = await this.getOne(id, companyId);
    const phone = normalizePhone(reminder.phone);
    const message =
      reminder.message ||
      (await this.buildMessageForEntity(reminder, companyId));

    const digits = (phone || '').replace(/\D/g, '');
    const text = encodeURIComponent(message);
    const waUrl = digits ? `https://wa.me/${digits}?text=${text}` : null;
    const smsUrl = digits ? `sms:${digits}?body=${text}` : null;

    return {
      id: reminder.id,
      phone: digits || null,
      message,
      waUrl,
      smsUrl,
      title: reminder.title,
      type: reminder.type,
      status: reminder.status,
    };
  }

  async markSent(id: string, companyId: string, dto?: MarkReminderDto) {
    const reminder = await this.getOne(id, companyId);
    const channel = dto?.channel || ReminderChannel.WHATSAPP;

    const updated = await this.prisma.reminder.update({
      where: { id },
      data: {
        status: ReminderStatus.SENT,
        sentAt: new Date(),
        channel,
      },
    });

    if (
      reminder.entityType === 'InstallmentPlan' &&
      reminder.entityId
    ) {
      const isOverdue = reminder.type === ReminderType.INSTALLMENT_OVERDUE;
      await this.prisma.installmentPlan.update({
        where: { id: reminder.entityId },
        data: isOverdue
          ? { overdueNoticeSent: true }
          : { reminderSent: true, reminderSentAt: new Date() },
      });
    }

    return updated;
  }

  async markDone(id: string, companyId: string) {
    await this.getOne(id, companyId);
    return this.prisma.reminder.update({
      where: { id },
      data: {
        status: ReminderStatus.DONE,
        completedAt: new Date(),
      },
    });
  }

  async skip(id: string, companyId: string) {
    await this.getOne(id, companyId);
    return this.prisma.reminder.update({
      where: { id },
      data: { status: ReminderStatus.SKIPPED },
    });
  }

  /**
   * Generate pending reminders from overdue/due installments + lead follow-ups.
   * Idempotent for open PENDING items on the same entity.
   */
  async generate(companyId: string) {
    const today = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());
    let created = 0;

    // Refresh installment statuses lightly via overdue/due query
    const installments = await this.prisma.installmentPlan.findMany({
      where: {
        booking: { companyId },
        paid: false,
        status: {
          in: [
            InstallmentStatus.OVERDUE,
            InstallmentStatus.DUE,
            InstallmentStatus.PARTIAL,
          ],
        },
      },
      include: {
        booking: {
          include: {
            customer: true,
            unit: true,
            project: { select: { name: true } },
          },
        },
      },
    });

    for (const inst of installments) {
      const due = startOfDay(inst.dueDate);
      const isOverdue =
        inst.status === InstallmentStatus.OVERDUE || due < today;
      const type = isOverdue
        ? ReminderType.INSTALLMENT_OVERDUE
        : ReminderType.INSTALLMENT_DUE;

      const existing = await this.prisma.reminder.findFirst({
        where: {
          companyId,
          entityType: 'InstallmentPlan',
          entityId: inst.id,
          status: ReminderStatus.PENDING,
        },
      });
      if (existing) continue;

      const balance = Math.max(0, inst.amount - (inst.paidAmount || 0));
      if (balance <= 0) continue;

      const customer = inst.booking.customer;
      const unit = inst.booking.unit;
      const message = [
        `Hi ${customer.name},`,
        `reminder for ${inst.milestone} installment of ₹${balance.toLocaleString('en-IN')}`,
        `due ${due.toLocaleDateString('en-IN')}`,
        `for unit ${unit.unitNumber}${inst.booking.project?.name ? ` at ${inst.booking.project.name}` : ''}.`,
        `Please clear at the earliest. Thank you.`,
      ].join(' ');

      await this.prisma.reminder.create({
        data: {
          companyId,
          type,
          channel: ReminderChannel.IN_APP,
          entityType: 'InstallmentPlan',
          entityId: inst.id,
          title: `${isOverdue ? 'Overdue' : 'Due'}: ${customer.name} · ${inst.milestone}`,
          message,
          phone: normalizePhone(customer.phone),
          dueAt: isOverdue ? today : due,
        },
      });
      created += 1;
    }

    const leads = await this.prisma.lead.findMany({
      where: {
        companyId,
        status: { notIn: ['CONVERTED', 'LOST'] },
        nextFollowUp: { lte: todayEnd },
      },
    });

    for (const lead of leads) {
      if (!lead.nextFollowUp) continue;
      const existing = await this.prisma.reminder.findFirst({
        where: {
          companyId,
          entityType: 'Lead',
          entityId: lead.id,
          status: ReminderStatus.PENDING,
        },
      });
      if (existing) continue;

      const message = [
        `Hi ${lead.name},`,
        `following up on your enquiry${lead.requirement ? ` for ${lead.requirement}` : ''}.`,
        `When would be a good time to connect?`,
      ].join(' ');

      await this.prisma.reminder.create({
        data: {
          companyId,
          type: ReminderType.LEAD_FOLLOW_UP,
          channel: ReminderChannel.IN_APP,
          entityType: 'Lead',
          entityId: lead.id,
          title: `Lead follow-up: ${lead.name}`,
          message,
          phone: normalizePhone(lead.phone),
          dueAt: lead.nextFollowUp,
        },
      });
      created += 1;
    }

    return { created, message: `Generated ${created} reminder(s)` };
  }

  private async getOne(id: string, companyId: string) {
    const reminder = await this.prisma.reminder.findFirst({
      where: { id, companyId },
    });
    if (!reminder) throw new NotFoundException('Reminder not found');
    return reminder;
  }

  private async buildMessageForEntity(
    reminder: {
      entityType: string;
      entityId: string | null;
      title: string;
      message: string | null;
    },
    companyId: string,
  ) {
    if (reminder.message) return reminder.message;
    if (!reminder.entityId) return reminder.title;

    if (reminder.entityType === 'Lead') {
      const lead = await this.prisma.lead.findFirst({
        where: { id: reminder.entityId, companyId },
      });
      if (!lead) return reminder.title;
      return `Hi ${lead.name}, following up on your enquiry. When can we connect?`;
    }

    if (reminder.entityType === 'InstallmentPlan') {
      const inst = await this.prisma.installmentPlan.findFirst({
        where: { id: reminder.entityId, booking: { companyId } },
        include: {
          booking: { include: { customer: true, unit: true } },
        },
      });
      if (!inst) return reminder.title;
      const bal = Math.max(0, inst.amount - (inst.paidAmount || 0));
      return `Hi ${inst.booking.customer.name}, reminder: ${inst.milestone} balance ₹${bal.toLocaleString('en-IN')} for unit ${inst.booking.unit.unitNumber}.`;
    }

    return reminder.title;
  }
}

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function normalizePhone(phone?: string | null) {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  // Prefer India default if 10-digit local
  if (digits.length === 10) return `91${digits}`;
  return digits || null;
}
