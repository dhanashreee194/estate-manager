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

        ...(dto.floor !== undefined && {
          floor: dto.floor,
        }),

        ...(dto.status && {
          status: dto.status, // ✅ ENUM
        }),

        ...(dto.bhkType !== undefined && {
          bhkType: dto.bhkType,
        }),

        ...(dto.layoutRow !== undefined && {
          layoutRow: dto.layoutRow,
        }),

        ...(dto.layoutCol !== undefined && {
          layoutCol: dto.layoutCol,
        }),

        ...(dto.wingId && {
          wing: {
            connect: { id: dto.wingId },
          },
        }),
      },
    });
  }

  /** Layout map payload: grid config + units with positions + status counts */
  async getLayoutMap(projectId: string, companyId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, companyId },
    });
    if (!project) throw new BadRequestException('Invalid project');

    const units = await this.prisma.unit.findMany({
      where: { projectId, companyId },
      include: {
        wing: { include: { building: true } },
        Booking: {
          select: {
            id: true,
            status: true,
            customer: { select: { id: true, name: true, phone: true } },
          },
        },
      },
      orderBy: [{ unitType: 'asc' }, { unitNumber: 'asc' }],
    });

    const summary = {
      AVAILABLE: 0,
      HOLD: 0,
      BOOKED: 0,
      SOLD: 0,
      CANCELLED: 0,
      TOTAL: units.length,
    };
    for (const u of units) {
      summary[u.status] = (summary[u.status] || 0) + 1;
    }

    return {
      project: {
        id: project.id,
        name: project.name,
        layoutRows: project.layoutRows ?? 10,
        layoutCols: project.layoutCols ?? 10,
        layoutImageUrl: project.layoutImageUrl,
      },
      summary,
      units: units.map((u) => ({
        id: u.id,
        unitNumber: u.unitNumber,
        unitType: u.unitType,
        status: u.status,
        areaSqFt: u.areaSqFt,
        basePrice: u.basePrice,
        floor: u.floor,
        direction: u.direction,
        layoutRow: u.layoutRow,
        layoutCol: u.layoutCol,
        wingId: u.wingId,
        wingName: u.wing?.name || null,
        buildingName: u.wing?.building?.name || null,
        booking: u.Booking
          ? {
              id: u.Booking.id,
              status: u.Booking.status,
              customerName: u.Booking.customer?.name,
              customerPhone: u.Booking.customer?.phone,
            }
          : null,
      })),
    };
  }

  async updateLayoutConfig(
    projectId: string,
    companyId: string,
    data: { layoutRows?: number; layoutCols?: number; layoutImageUrl?: string | null },
  ) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, companyId },
    });
    if (!project) throw new BadRequestException('Invalid project');

    return this.prisma.project.update({
      where: { id: projectId },
      data: {
        ...(data.layoutRows !== undefined && { layoutRows: data.layoutRows }),
        ...(data.layoutCols !== undefined && { layoutCols: data.layoutCols }),
        ...(data.layoutImageUrl !== undefined && {
          layoutImageUrl: data.layoutImageUrl,
        }),
      },
    });
  }

  /** Place units without layout coords into the grid left→right, top→bottom */
  async autoArrangeLayout(projectId: string, companyId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, companyId },
    });
    if (!project) throw new BadRequestException('Invalid project');

    const rows = project.layoutRows ?? 10;
    const cols = project.layoutCols ?? 10;

    const units = await this.prisma.unit.findMany({
      where: { projectId, companyId },
      orderBy: [{ unitType: 'asc' }, { unitNumber: 'asc' }],
    });

    const occupied = new Set(
      units
        .filter((u) => u.layoutRow != null && u.layoutCol != null)
        .map((u) => `${u.layoutRow}:${u.layoutCol}`),
    );

    const unplaced = units.filter(
      (u) => u.layoutRow == null || u.layoutCol == null,
    );

    let r = 0;
    let c = 0;
    const updates: Promise<any>[] = [];

    const nextFree = () => {
      while (r < rows) {
        while (c < cols) {
          const key = `${r}:${c}`;
          if (!occupied.has(key)) {
            occupied.add(key);
            const pos = { layoutRow: r, layoutCol: c };
            c += 1;
            return pos;
          }
          c += 1;
        }
        c = 0;
        r += 1;
      }
      return null;
    };

    for (const unit of unplaced) {
      const pos = nextFree();
      if (!pos) break;
      updates.push(
        this.prisma.unit.update({
          where: { id: unit.id },
          data: pos,
        }),
      );
    }

    await Promise.all(updates);
    return this.getLayoutMap(projectId, companyId);
  }

  async placeUnit(
    unitId: string,
    companyId: string,
    layoutRow: number | null,
    layoutCol: number | null,
  ) {
    const unit = await this.prisma.unit.findFirst({
      where: { id: unitId, companyId },
    });
    if (!unit) throw new BadRequestException('Unit not found');

    if (layoutRow != null && layoutCol != null) {
      const clash = await this.prisma.unit.findFirst({
        where: {
          projectId: unit.projectId,
          companyId,
          layoutRow,
          layoutCol,
          NOT: { id: unitId },
        },
      });
      if (clash) {
        throw new BadRequestException(
          `Cell already occupied by unit ${clash.unitNumber}`,
        );
      }
    }

    return this.prisma.unit.update({
      where: { id: unitId },
      data: { layoutRow, layoutCol },
    });
  }

  getUnitsByWing(wingId: string, companyId: string) {
    return this.prisma.unit.findMany({
      where: {
        wingId,
        companyId,
        unitType: 'FLAT',
      },
      orderBy: [{ floor: 'asc' }, { unitNumber: 'asc' }],
    });
  }
}
