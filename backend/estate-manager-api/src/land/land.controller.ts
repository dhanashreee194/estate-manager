import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { LandService } from './land.service';
import {
  AddParcelPartnerDto,
  CreateLandPartnerDto,
  UpdateLandPartnerDto,
} from './dto/land-partner.dto';
import {
  CreateLandParcelDto,
  CreateLandPaymentDto,
  UpdateLandParcelDto,
} from './dto/land-parcel.dto';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('ADMIN', 'SUPERVISOR', 'ACCOUNTANT')
@Controller('land')
export class LandController {
  constructor(private readonly landService: LandService) {}

  @Get('summary')
  summary(@Req() req) {
    return this.landService.getSummary(req.user.companyId);
  }

  // Partners
  @Post('partners')
  createPartner(@Body() dto: CreateLandPartnerDto, @Req() req) {
    return this.landService.createPartner(dto, req.user.companyId);
  }

  @Get('partners')
  partners(@Req() req, @Query('all') all?: string) {
    return this.landService.findPartners(req.user.companyId, all !== '1');
  }

  @Patch('partners/:id')
  updatePartner(
    @Param('id') id: string,
    @Body() dto: UpdateLandPartnerDto,
    @Req() req,
  ) {
    return this.landService.updatePartner(id, dto, req.user.companyId);
  }

  @Delete('partners/:id')
  deactivatePartner(@Param('id') id: string, @Req() req) {
    return this.landService.deactivatePartner(id, req.user.companyId);
  }

  // Payments
  @Post('payments')
  createPayment(@Body() dto: CreateLandPaymentDto, @Req() req) {
    return this.landService.createPayment(dto, req.user.companyId);
  }

  @Get('payments')
  payments(
    @Req() req,
    @Query('landParcelId') landParcelId?: string,
    @Query('partnerId') partnerId?: string,
  ) {
    return this.landService.findPayments(req.user.companyId, {
      landParcelId,
      partnerId,
    });
  }

  // Parcels
  @Post('parcels')
  createParcel(@Body() dto: CreateLandParcelDto, @Req() req) {
    return this.landService.createParcel(dto, req.user.companyId);
  }

  @Get('parcels')
  parcels(
    @Req() req,
    @Query('status') status?: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.landService.findParcels(req.user.companyId, {
      status,
      projectId,
    });
  }

  @Get('parcels/:id')
  getParcel(@Param('id') id: string, @Req() req) {
    return this.landService.findParcel(id, req.user.companyId);
  }

  @Patch('parcels/:id')
  updateParcel(
    @Param('id') id: string,
    @Body() dto: UpdateLandParcelDto,
    @Req() req,
  ) {
    return this.landService.updateParcel(id, dto, req.user.companyId);
  }

  @Post('parcels/:id/partners')
  addPartner(
    @Param('id') id: string,
    @Body() dto: AddParcelPartnerDto,
    @Req() req,
  ) {
    return this.landService.addParcelPartner(id, dto, req.user.companyId);
  }

  @Delete('parcels/:id/partners/:shareId')
  removePartner(
    @Param('id') id: string,
    @Param('shareId') shareId: string,
    @Req() req,
  ) {
    return this.landService.removeParcelPartner(
      id,
      shareId,
      req.user.companyId,
    );
  }
}
