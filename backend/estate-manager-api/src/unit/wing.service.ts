import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateWingDto } from './dto/create-wing.dto';
import { UpdateWingDto } from './dto/update-wing.dto';

@Injectable()
export class WingService {
  constructor(private prisma: PrismaService) {}

  async createWing(dto: CreateWingDto, companyId: string) {
    if (!dto.buildingId || !dto.name) {
      throw new BadRequestException('Building and wing name are required');
    }
    if (!dto.totalFloors || dto.totalFloors < 1) {
      throw new BadRequestException('Total floors must be at least 1');
    }
    if (!dto.flatsPerFloor || dto.flatsPerFloor < 1) {
      throw new BadRequestException('Flats per floor must be at least 1');
    }

    const building = await this.prisma.building.findFirst({
      where: { id: dto.buildingId, companyId },
    });
    if (!building) {
      throw new BadRequestException('Building not found or access denied');
    }

    const shouldAutoCreate = Boolean(dto.autoCreateFlats);
    let startFloor = dto.flatConfig?.startFloor ?? 1;
    let endFloor = dto.flatConfig?.endFloor ?? dto.totalFloors;
    const areaSqFt = dto.flatConfig?.areaSqFt;
    const basePrice = dto.flatConfig?.basePrice;

    if (shouldAutoCreate) {
      if (!Number.isFinite(startFloor) || !Number.isFinite(endFloor)) {
        throw new BadRequestException('Start and end floor are required');
      }
      if (startFloor < 1 || endFloor < startFloor) {
        throw new BadRequestException(
          'End floor must be greater than or equal to start floor',
        );
      }
      if (endFloor > dto.totalFloors) {
        throw new BadRequestException(
          'End floor cannot exceed total floors for this wing',
        );
      }
      if (!areaSqFt || areaSqFt <= 0 || !basePrice || basePrice <= 0) {
        throw new BadRequestException(
          'Area (sq ft) and base price are required to auto-create flats',
        );
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const wing = await tx.wing.create({
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
          flats: true,
        },
      });

      if (!shouldAutoCreate) {
        return wing;
      }

      const flats: Prisma.UnitCreateManyInput[] = [];
      for (let floor = startFloor; floor <= endFloor; floor++) {
        for (let i = 1; i <= dto.flatsPerFloor; i++) {
          flats.push({
            companyId,
            projectId: building.projectId,
            wingId: wing.id,
            unitType: 'FLAT',
            unitNumber: `${floor}${String(i).padStart(2, '0')}`,
            floor,
            areaSqFt: areaSqFt!,
            basePrice: basePrice!,
            direction: dto.flatConfig?.direction || null,
            bhkType: dto.flatConfig?.bhkType || null,
            status: 'AVAILABLE',
          });
        }
      }

      if (flats.length === 0) {
        throw new BadRequestException('No flats to create for the given range');
      }

      await tx.unit.createMany({ data: flats });

      return tx.wing.findUniqueOrThrow({
        where: { id: wing.id },
        include: {
          building: true,
          flats: true,
        },
      });
    });
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
