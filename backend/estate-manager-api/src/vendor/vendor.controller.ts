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
import { VendorService } from './vendor.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('vendors')
export class VendorController {
  constructor(private readonly vendorService: VendorService) {}

  @Post()
  create(@Body() dto: CreateVendorDto, @Req() req) {
    return this.vendorService.create(dto, req.user.companyId);
  }

  @Get()
  findAll(@Req() req, @Query('type') type?: string) {
    return this.vendorService.findAll(req.user.companyId, type);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    return this.vendorService.findOne(id, req.user.companyId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateVendorDto, @Req() req) {
    return this.vendorService.update(id, dto, req.user.companyId);
  }

  @Delete(':id')
  deactivate(@Param('id') id: string, @Req() req) {
    return this.vendorService.deactivate(id, req.user.companyId);
  }

  @Post(':id/payment')
  recordPayment(@Param('id') id: string, @Body() body, @Req() req) {
    return this.vendorService.recordPayment(id, body, req.user.companyId);
  }
}
