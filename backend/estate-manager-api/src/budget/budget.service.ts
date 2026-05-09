import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class BudgetService {
  constructor(private prisma: PrismaService) {}

  // ✅ SET / UPDATE PROJECT BUDGET
  async setProjectBudget(projectId: string, amount: number, companyId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, companyId },
    });

    if (!project) {
      throw new BadRequestException('Invalid project');
    }

    return this.prisma.projectBudget.upsert({
      where: { projectId },
      update: { amount },
      create: { projectId, amount },
    });
  }

  // (Optional) get project budget
  async getProjectBudget(projectId: string, companyId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, companyId },
    });

    if (!project) {
      throw new BadRequestException('Invalid project');
    }

    return this.prisma.projectBudget.findUnique({
      where: { projectId },
    });
  }
}
