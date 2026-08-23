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
import { WingService } from './wing.service';
import { CreateWingDto } from './dto/create-wing.dto';
import { UpdateWingDto } from './dto/update-wing.dto';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('wing')
export class WingController {
  constructor(private readonly wingService: WingService) {}

  // @Post()
  // @Roles('ADMIN', 'SUPERVISOR')
  // create(@Body() dto: CreateWingDto, @Req() req) {
  //   return this.wingService.createWing(dto, req.user.companyId);
  // }

  @Get('building/:buildingId')
  @Roles('ADMIN', 'SALES')
  getByBuilding(@Param('buildingId') buildingId: string, @Req() req) {
    return this.wingService.getWingsByBuilding(buildingId, req.user.companyId);
  }

  @Post()
  create(@Body() dto: CreateWingDto, @Req() req) {
    return this.wingService.createWing(dto, req.user.companyId);
  }

  // Update wing
  @Put(':id')
  @Roles('ADMIN', 'SUPERVISOR')
  update(@Param('id') wingId: string, @Body() dto: UpdateWingDto, @Req() req) {
    return this.wingService.updateWing(wingId, dto, req.user.companyId);
  }
}
