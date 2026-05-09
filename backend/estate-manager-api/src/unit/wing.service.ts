import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateWingDto } from './dto/create-wing.dto';
import { UpdateWingDto } from './dto/update-wing.dto';

@Injectable()
export class WingService {
  constructor(private prisma: PrismaService) {}

  async createWing(dto: CreateWingDto, companyId: string) {
    // 1. Create Wing
    const wing = await this.prisma.wing.create({
      data: {
        buildingId: dto.buildingId,
        name: dto.name,
        totalFloors: dto.totalFloors,
        flatsPerFloor: dto.flatsPerFloor,
        hasLift: dto.hasLift,
        companyId,
      },
      include: {
        building: true,
      },
    });

    // 2. Auto-create flats
    if (dto.autoCreateFlats && dto.flatConfig) {
      const flats: Prisma.UnitCreateManyInput[] = [];

      for (
        let floor = dto.flatConfig.startFloor;
        floor <= dto.flatConfig.endFloor;
        floor++
      ) {
        for (let i = 1; i <= dto.flatsPerFloor; i++) {
          flats.push({
            companyId,
            projectId: wing.building.projectId,
            wingId: wing.id,

            unitType: 'FLAT',

            unitNumber: `${floor}${String(i).padStart(2, '0')}`,

            areaSqFt: dto.flatConfig.areaSqFt,
            basePrice: dto.flatConfig.basePrice,
            direction: dto.flatConfig.direction,
            bhkType: dto.flatConfig.bhkType,
            status: 'AVAILABLE',
          });
        }
      }

      await this.prisma.unit.createMany({
        data: flats,
      });
    }

    return wing;
  }

  getWingsByBuilding(buildingId: string, companyId: string) {
    return this.prisma.wing.findMany({
      where: {
        buildingId,
        companyId,
      },
      include: {
        flats: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async updateWing(wingId: string, dto: UpdateWingDto, companyId: string) {
    // Verify ownership
    const wing = await this.prisma.wing.findFirst({
      where: { id: wingId, companyId },
    });

    if (!wing) {
      throw new BadRequestException('Wing not found or access denied');
    }

    return this.prisma.wing.update({
      where: { id: wingId },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.totalFloors && { totalFloors: dto.totalFloors }),
        ...(dto.flatsPerFloor && { flatsPerFloor: dto.flatsPerFloor }),
        ...(dto.hasLift !== undefined && { hasLift: dto.hasLift }),
        ...(dto.liftsCount !== undefined && { liftsCount: dto.liftsCount }),
      },
      include: {
        building: true,
        flats: true,
      },
    });
  }
}
