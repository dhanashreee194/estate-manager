import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UnitService } from './unit.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { Roles } from 'src/auth/roles.decorator';
import { CreateBulkFlatsDto } from './dto/create-bulk-flats.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('unit')
export class UnitController {
  constructor(private readonly unitService: UnitService) {}

  // Create unit
  @Post()
  @Roles('ADMIN')
  create(@Body() dto: CreateUnitDto, @Req() req) {
    return this.unitService.createUnit(dto, req.user.companyId);
  }

  // Get all units in project
  @Get('project/:projectId')
  @Roles('ADMIN', 'SALES')
  getUnits(@Param('projectId') projectId: string, @Req() req) {
    return this.unitService.getUnitsByProject(projectId, req.user.companyId);
  }
  // Get available units only
  @Get('project/:projectId/available')
  @Roles('ADMIN', 'SALES')
  getAvailable(@Param('projectId') projectId: string, @Req() req) {
    return this.unitService.getAvailableUnits(projectId, req.user.companyId);
  }

  @Post('bulk/flats')
  @Roles('ADMIN')
  createBulkFlats(@Body() dto: CreateBulkFlatsDto, @Req() req) {
    return this.unitService.createBulkFlats(dto, req.user.companyId);
  }

  // Update unit
  @Put(':id')
  @Roles('ADMIN')
  update(@Param('id') unitId: string, @Body() dto: UpdateUnitDto, @Req() req) {
    return this.unitService.updateUnit(unitId, dto, req.user.companyId);
  }

  @Get('wing/:wingId')
  @Roles('ADMIN', 'SALES')
  getByWing(@Param('wingId') wingId: string, @Req() req) {
    return this.unitService.getUnitsByWing(wingId, req.user.companyId);
  }
}
