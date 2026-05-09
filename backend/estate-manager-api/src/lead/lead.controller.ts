import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { LeadService } from './lead.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { AuthGuard } from '@nestjs/passport';
import { LeadStatus } from '@prisma/client';

@UseGuards(AuthGuard('jwt'))
@Controller('lead')
export class LeadController {
  constructor(private readonly leadService: LeadService) {}

  // ✅ CREATE
  @Post()
  create(@Body() dto: CreateLeadDto, @Req() req) {
    return this.leadService.create(dto, req.user.companyId);
  }

  // ✅ GET ALL
  @Get()
  findAll(@Req() req) {
    return this.leadService.findAll(req.user.companyId);
  }

  // ✅ KANBAN (MOVE THIS UP)
  @Get('kanban')
  getKanban(@Req() req) {
    return this.leadService.getKanban(req.user.companyId);
  }

  // ✅ GET ONE
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    return this.leadService.findOne(id, req.user.companyId);
  }

  // ✅ UPDATE FULL
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateLeadDto, @Req() req) {
    return this.leadService.update(id, dto, req.user.companyId);
  }

  // ✅ UPDATE STATUS
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: LeadStatus,
    @Req() req,
  ) {
    return this.leadService.updateStatus(id, status, req.user.companyId);
  }

  // ✅ DELETE
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    return this.leadService.remove(id, req.user.companyId);
  }
}
