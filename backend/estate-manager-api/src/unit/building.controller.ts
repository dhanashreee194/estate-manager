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
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { BuildingService } from './building.service';
import {
  CreateBuildingDto,
  UpdateBuildingDto,
} from './dto/create-building.dto';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('building')
export class BuildingController {
  constructor(private readonly buildingService: BuildingService) {}

  @Post()
  @Roles('ADMIN', 'SUPERVISOR')
  create(@Body() dto: CreateBuildingDto, @Req() req) {
    return this.buildingService.createBuilding(dto, req.user.companyId);
  }

  @Get('project/:projectId')
  @Roles('ADMIN', 'SALES')
  getByProject(@Param('projectId') projectId: string, @Req() req) {
    return this.buildingService.getBuildingsByProject(
      projectId,
      req.user.companyId,
    );
  }

  // Update building
  @Put(':id')
  @Roles('ADMIN', 'SUPERVISOR')
  update(
    @Param('id') buildingId: string,
    @Body() dto: UpdateBuildingDto,
    @Req() req,
  ) {
    return this.buildingService.updateBuilding(
      buildingId,
      dto,
      req.user.companyId,
    );
  }
}
