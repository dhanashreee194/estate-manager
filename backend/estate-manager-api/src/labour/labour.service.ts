import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateLabourDto } from './dto/create-labour.dto';
import { AssignLabourDto } from './dto/assign-labour.dto';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';

@Injectable()
export class LabourService {
  constructor(private prisma: PrismaService) {}

  // 1️⃣ Create labour
  createLabour(dto: CreateLabourDto, companyId: string) {
    return this.prisma.labour.create({
      data: {
        ...dto,
        companyId,
      },
    });
  }

  getLabours(companyId: string) {
    return this.prisma.labour.findMany({
      where: { companyId },
    });
  }

  // 2️⃣ Assign labour to project
  async assignLabour(dto: AssignLabourDto, companyId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: dto.projectId, companyId },
    });

    if (!project) {
      throw new BadRequestException('Invalid project access');
    }

    return this.prisma.labourAssignment.create({
      data: {
        labourId: dto.labourId,
        projectId: dto.projectId,
      },
    });
  }

  // 3️⃣ Mark attendance (AUTO EXPENSE)
  async markAttendance(dto: MarkAttendanceDto, companyId: string) {
    const labour = await this.prisma.labour.findUnique({
      where: { id: dto.labourId },
    });

    if (!labour) {
      throw new NotFoundException('Labour not found');
    }

    const project = await this.prisma.project.findFirst({
      where: { id: dto.projectId, companyId },
    });

    if (!project) {
      throw new BadRequestException('Invalid project access');
    }

    const attendance = await this.prisma.labourAttendance.upsert({
      where: {
        labourId_projectId_date: {
          labourId: dto.labourId,
          projectId: dto.projectId,
          date: new Date(dto.date),
        },
      },
      update: {
        present: dto.present,
        wageForDay: dto.present ? labour.dailyWage : 0,
      },
      create: {
        labourId: dto.labourId,
        projectId: dto.projectId,
        date: new Date(dto.date),
        present: dto.present,
        wageForDay: dto.present ? labour.dailyWage : 0,
      },
    });

    // Create expense if present and not created yet
    if (dto.present && !attendance.expenseId) {
      const expense = await this.prisma.expense.create({
        data: {
          projectId: dto.projectId,
          type: 'LABOUR',
          amount: labour.dailyWage,
          date: new Date(dto.date),
        },
      });

      await this.prisma.labourAttendance.update({
        where: { id: attendance.id },
        data: { expenseId: expense.id },
      });
    }

    return attendance;
  }

  // 4️⃣ Get attendance
  getProjectAttendance(projectId: string, companyId: string) {
    return this.prisma.labourAttendance.findMany({
      where: {
        projectId,
        project: { companyId },
      },
      include: {
        labour: true,
      },
    });
  }

  getAssignedLabours(projectId: string, companyId: string) {
    return this.prisma.labourAssignment.findMany({
      where: {
        projectId,
        project: { companyId },
      },
      include: {
        labour: true,
      },
    });
  }

  async removeAssignment(id: string, companyId: string) {
    const assignment = await this.prisma.labourAssignment.findFirst({
      where: { id, project: { companyId } },
    });

    if (!assignment) {
      throw new BadRequestException('Invalid assignment');
    }

    return this.prisma.labourAssignment.delete({
      where: { id },
    });
  }

  // 5️⃣ Update attendance (FIXED)
  async updateAttendance(
    id: string,
    dto: UpdateAttendanceDto,
    companyId: string,
  ) {
    const attendance = await this.prisma.labourAttendance.findFirst({
      where: {
        id,
        project: { companyId },
      },
    });

    if (!attendance) {
      throw new BadRequestException('Attendance not found');
    }

    const updated = await this.prisma.labourAttendance.update({
      where: { id },
      data: {
        present: dto.present,
        wageForDay: dto.wageForDay,
      },
    });

    // handle expense
    if (attendance.expenseId) {
      if (!dto.present) {
        // delete expense if worker now absent
        await this.prisma.expense.delete({
          where: { id: attendance.expenseId },
        });

        await this.prisma.labourAttendance.update({
          where: { id },
          data: { expenseId: null },
        });
      } else {
        // update expense amount
        await this.prisma.expense.update({
          where: { id: attendance.expenseId },
          data: { amount: dto.wageForDay },
        });
      }
    }

    return updated;
  }

  // 6️⃣ Delete attendance (FIXED)
  async deleteAttendance(id: string, companyId: string) {
    const attendance = await this.prisma.labourAttendance.findFirst({
      where: {
        id,
        project: { companyId },
      },
    });

    if (!attendance) {
      throw new BadRequestException('Attendance not found');
    }

    if (attendance.expenseId) {
      await this.prisma.expense.delete({
        where: { id: attendance.expenseId },
      });
    }

    return this.prisma.labourAttendance.delete({
      where: { id },
    });
  }
}
