import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';

@Injectable()
export class ProjectService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateProjectDto, companyId: string) {
    return this.prisma.project.create({
      data: {
        ...dto,
        company: {
          connect: { id: companyId },
        },
      },
    });
  }

  findAll(companyId: string) {
    return this.prisma.project.findMany({
      where: {
        companyId,
      },
    });
  }
}
