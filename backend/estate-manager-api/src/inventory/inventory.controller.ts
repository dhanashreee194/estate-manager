import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { InventoryInwardDto } from './dto/inventory-inward.dto';
import { InventoryOutwardDto } from './dto/inventory-outward.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/auth/roles.decorator';

@UseGuards(AuthGuard('jwt'))
@Roles('ADMIN', 'ACCOUNTANT')
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('material')
  createMaterial(@Body() dto: CreateMaterialDto, @Req() req) {
    return this.inventoryService.createMaterial(dto, req.user.companyId);
  }

  @Post('inward')
  addStock(@Body() dto: InventoryInwardDto, @Req() req) {
    return this.inventoryService.addStock(dto, req.user.companyId);
  }

  @Post('outward')
  removeStock(@Body() dto: InventoryOutwardDto, @Req() req) {
    return this.inventoryService.removeStock(dto, req.user.companyId);
  }

  @Get('project/:projectId')
  getInventory(@Param('projectId') projectId: string, @Req() req) {
    return this.inventoryService.getInventoryByProject(
      projectId,
      req.user.companyId,
    );
  }

  @Get('material')
  getMaterials(@Req() req) {
    return this.inventoryService.findMaterials(req.user.companyId);
  }

  // 🔹 Project-wise Inward History
  @Get('inward/project/:projectId')
  getProjectInward(@Param('projectId') projectId: string, @Req() req) {
    return this.inventoryService.getProjectInwardHistory(
      projectId,
      req.user.companyId,
    );
  }

  // 🔹 Material-wise Inward History
  @Get('inward/:projectId/:materialId')
  getMaterialInward(
    @Param('projectId') projectId: string,
    @Param('materialId') materialId: string,
    @Req() req,
  ) {
    return this.inventoryService.getMaterialInwardHistory(
      projectId,
      materialId,
      req.user.companyId,
    );
  }

  // 🔹 Project-wise Outward History
  @Get('outward/project/:projectId')
  getProjectOutward(@Param('projectId') projectId: string, @Req() req) {
    return this.inventoryService.getProjectOutwardHistory(
      projectId,
      req.user.companyId,
    );
  }

  // 🔹 Material-wise Outward History
  @Get('outward/:projectId/:materialId')
  getMaterialOutward(
    @Param('projectId') projectId: string,
    @Param('materialId') materialId: string,
    @Req() req,
  ) {
    return this.inventoryService.getMaterialOutwardHistory(
      projectId,
      materialId,
      req.user.companyId,
    );
  }

  @Get('inward/:projectId')
  getInwardHistory(@Param('projectId') projectId: string, @Req() req) {
    return this.inventoryService.getInwardHistory(
      projectId,
      req.user.companyId,
    );
  }

  @Get('outward/:projectId')
  getOutwardHistory(@Param('projectId') projectId: string, @Req() req) {
    return this.inventoryService.getOutwardHistory(
      projectId,
      req.user.companyId,
    );
  }

  @Post('requirement')
  createRequirement(@Body() dto, @Req() req) {
    return this.inventoryService.createRequirement(
      dto.projectId,
      dto.materialId,
      dto.quantity,
    );
  }

  @Get('requirement/:projectId')
  getRequirements(@Param('projectId') projectId: string) {
    return this.inventoryService.getRequirements(projectId);
  }
}
