import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { InventoryInwardDto } from './dto/inventory-inward.dto';
import { InventoryOutwardDto } from './dto/inventory-outward.dto';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  // 1️⃣ Create material (COMPANY SAFE)
  createMaterial(dto: CreateMaterialDto, companyId: string) {
    return this.prisma.material.create({
      data: {
        name: dto.name,
        unit: dto.unit,
        unitCost: dto.unitCost,
        company: {
          connect: { id: companyId },
        },
      },
    });
  }

  // 2️⃣ Inward stock (COMPANY SAFE)
  async addStock(dto: InventoryInwardDto, companyId: string) {
    const project = await this.prisma.project.findFirst({
      where: {
        id: dto.projectId,
        companyId,
      },
    });

    console.log('🔥 ADD STOCK HIT', dto, companyId);
    if (!project) {
      throw new BadRequestException('Invalid project access');
    }

    // ✅ Update inventory stock
    const inventory = await this.prisma.inventory.upsert({
      where: {
        projectId_materialId: {
          projectId: dto.projectId,
          materialId: dto.materialId,
        },
      },
      update: {
        quantity: {
          increment: dto.quantity,
        },
      },
      create: {
        projectId: dto.projectId,
        materialId: dto.materialId,
        quantity: dto.quantity,
      },
    });

    console.log('🔥 BEFORE INWARD CREATE');
    // ✅ RECORD INWARD HISTORY (MANDATORY)
    await this.prisma.inventoryInward.create({
      data: {
        projectId: dto.projectId,
        materialId: dto.materialId,
        quantity: dto.quantity,
      },
    });
    console.log('🔥 AFTER INWARD CREATE');
    return inventory;
  }

  // 3️⃣ Outward stock (AUTO-EXPENSE + COMPANY SAFE)
  async removeStock(dto: InventoryOutwardDto, companyId: string) {
    const inventory = await this.prisma.inventory.findFirst({
      where: {
        projectId: dto.projectId,
        materialId: dto.materialId,
        project: { companyId },
      },
      include: { material: true },
    });

    if (!inventory || inventory.quantity < dto.quantity) {
      throw new BadRequestException('Insufficient stock');
    }

    // 🔻 Reduce stock
    const updatedInventory = await this.prisma.inventory.update({
      where: { id: inventory.id },
      data: {
        quantity: { decrement: dto.quantity },
      },
    });

    // ✅ CREATE OUTWARD HISTORY
    await this.prisma.inventoryOutward.create({
      data: {
        projectId: dto.projectId,
        materialId: dto.materialId,
        quantity: dto.quantity,
      },
    });

    // 💰 Auto expense
    await this.prisma.expense.create({
      data: {
        projectId: dto.projectId,
        type: 'MATERIAL',
        amount: dto.quantity * inventory.material.unitCost,
        date: new Date(),
        inventoryId: inventory.id,
      },
    });

    return updatedInventory;
  }

  // 4️⃣ Get inventory by project (COMPANY SAFE)
  getInventoryByProject(projectId: string, companyId: string) {
    return this.prisma.inventory.findMany({
      where: {
        projectId,
        project: {
          companyId,
        },
      },
      include: {
        material: true,
      },
    });
  }

  // 5️⃣ Get materials for company
  findMaterials(companyId: string) {
    return this.prisma.material.findMany({
      where: {
        companyId,
      },
    });
  }

  // 6️⃣ Project-wise Inward History
  getProjectInwardHistory(projectId: string, companyId: string) {
    return this.prisma.inventoryInward.findMany({
      where: {
        projectId,
        project: {
          companyId,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        material: {
          select: {
            id: true,
            name: true,
            unit: true,
          },
        },
      },
    });
  }

  // 7️⃣ Material-wise Inward History (Drawer)
  getMaterialInwardHistory(
    projectId: string,
    materialId: string,
    companyId: string,
  ) {
    return this.prisma.inventoryInward.findMany({
      where: {
        projectId,
        materialId,
        project: {
          companyId,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // 8️⃣ Project-wise Outward History
  getProjectOutwardHistory(projectId: string, companyId: string) {
    return this.prisma.inventoryOutward.findMany({
      where: {
        projectId,
        project: {
          companyId,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        material: {
          select: {
            id: true,
            name: true,
            unit: true,
          },
        },
      },
    });
  }

  // 9️⃣ Material-wise Outward History (Drawer)
  getMaterialOutwardHistory(
    projectId: string,
    materialId: string,
    companyId: string,
  ) {
    return this.prisma.inventoryOutward.findMany({
      where: {
        projectId,
        materialId,
        project: {
          companyId,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  getInwardHistory(projectId: string, companyId: string) {
    return this.prisma.inventoryInward.findMany({
      where: {
        projectId,
        project: {
          companyId,
        },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        material: {
          select: {
            name: true,
            unit: true,
          },
        },
      },
    });
  }

  // inventory.service.ts
  async getOutwardHistory(projectId: string, companyId: string) {
    const result = await this.prisma.inventoryOutward.findMany({
      where: {
        projectId,
        project: { companyId },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        material: {
          select: {
            name: true,
            unit: true,
          },
        },
        project: {
          select: {
            inventories: {
              select: {
                materialId: true,
                quantity: true,
              },
            },
          },
        },
      },
    });

    // ✅ THIS IS WHERE YOU MAP
    return result.map((row) => {
      const inventory = row.project.inventories.find(
        (i) => i.materialId === row.materialId,
      );

      return {
        id: row.id,
        material: row.material,
        outwardQty: row.quantity,
        availableQty: inventory?.quantity ?? 0,
        createdAt: row.createdAt,
      };
    });
  }

  // Raise requirement
  createRequirement(projectId: string, materialId: string, qty: number) {
    return this.prisma.inventoryRequirement.create({
      data: {
        projectId,
        materialId,
        requiredQty: qty,
      },
      include: { material: true },
    });
  }

  // Get requirements
  getRequirements(projectId: string) {
    return this.prisma.inventoryRequirement.findMany({
      where: { projectId },
      include: { material: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
