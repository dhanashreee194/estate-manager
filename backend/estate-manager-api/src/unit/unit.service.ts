import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { CreateBulkFlatsDto } from './dto/create-bulk-flats.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class UnitService {
  constructor(private prisma: PrismaService) {}

  // 1️⃣ Create unit (COMPANY SAFE)
  async createUnit(dto: CreateUnitDto, companyId: string) {
    return this.prisma.unit.create({
      data: {
        unitType: dto.unitType,
        unitNumber: dto.unitNumber,
        areaSqFt: dto.areaSqFt,
        basePrice: dto.basePrice,
        direction: dto.direction,
        status: 'AVAILABLE',

        Company: {
          connect: { id: companyId },
        },

        project: {
          connect: { id: dto.projectId },
        },

        ...(dto.wingId && {
          wing: {
            connect: { id: dto.wingId },
          },
        }),
      },
    });
  }

  // 2️⃣ Get units by project (COMPANY SAFE)
  getUnitsByProject(projectId: string, companyId: string) {
    return this.prisma.unit.findMany({
      where: {
        projectId,
        companyId,
      },
      orderBy: {
        unitNumber: 'asc',
      },
    });
  }

  // 3️⃣ Get available units only
  getAvailableUnits(projectId: string, companyId: string) {
    return this.prisma.unit.findMany({
      where: {
        projectId,
        companyId,
        status: 'AVAILABLE',
      },
    });
  }

  async createBulkFlats(dto: CreateBulkFlatsDto, companyId: string) {
    const flats: Prisma.UnitCreateManyInput[] = [];

    for (let floor = dto.startFloor; floor <= dto.endFloor; floor++) {
      for (let i = 1; i <= dto.flatsPerFloor; i++) {
        flats.push({
          companyId,
          projectId: dto.projectId,
          wingId: dto.wingId,

          unitType: 'FLAT',

          unitNumber: `${floor}${String(i).padStart(2, '0')}`,
          floor,

          areaSqFt: dto.areaSqFt,
          basePrice: dto.basePrice,
          direction: dto.direction,

          status: 'AVAILABLE',
        });
      }
    }

    return this.prisma.unit.createMany({
      data: flats,
    });
  }

  // 4️⃣ Update unit (COMPANY SAFE)
  async updateUnit(unitId: string, dto: UpdateUnitDto, companyId: string) {
    const unit = await this.prisma.unit.findFirst({
      where: {
        id: unitId,
        companyId,
      },
    });

    if (!unit) {
      throw new BadRequestException('Unit not found or access denied');
    }

    return this.prisma.unit.update({
      where: { id: unitId },

      data: {
        ...(dto.unitNumber && { unitNumber: dto.unitNumber }),

        ...(dto.areaSqFt !== undefined && {
          areaSqFt: dto.areaSqFt,
        }),

        ...(dto.basePrice !== undefined && {
          basePrice: dto.basePrice,
        }),

        ...(dto.direction !== undefined && {
          direction: dto.direction,
        }),

        ...(dto.status && {
          status: dto.status, // ✅ ENUM
        }),

        ...(dto.wingId && {
          wing: {
            connect: { id: dto.wingId },
          },
        }),
      },
    });
  }

  getUnitsByWing(wingId: string, companyId: string) {
    return this.prisma.unit.findMany({
      where: {
        wingId,
        companyId,
        unitType: 'FLAT',
        status: 'AVAILABLE',
      },
      orderBy: {
        unitNumber: 'asc',
      },
    });
  }
}
