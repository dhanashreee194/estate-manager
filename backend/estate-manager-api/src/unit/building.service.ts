import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateBuildingDto,
  UpdateBuildingDto,
} from './dto/create-building.dto';

@Injectable()
export class BuildingService {
  constructor(private prisma: PrismaService) {}

  createBuilding(dto: CreateBuildingDto, companyId: string) {
    return this.prisma.building.create({
      data: {
        name: dto.name,
        facing: dto.facing,
        companyId,
        projectId: dto.projectId,
      },
    });
  }

  getBuildingsByProject(projectId: string, companyId: string) {
    return this.prisma.building.findMany({
      where: { projectId, companyId },
      include: { wings: true },
    });
  }

  async updateBuilding(
    buildingId: string,
    dto: UpdateBuildingDto,
    companyId: string,
  ) {
    // Verify ownership
    const building = await this.prisma.building.findFirst({
      where: { id: buildingId, companyId },
    });

    if (!building) {
      throw new BadRequestException('Building not found or access denied');
    }

    return this.prisma.building.update({
      where: { id: buildingId },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.facing !== undefined && { facing: dto.facing }),
      },
      include: { wings: true },
    });
  }
}
