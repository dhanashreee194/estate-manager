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
  Query,
} from '@nestjs/common';
import { LeadService } from './lead.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { AuthGuard } from '@nestjs/passport';
import { LeadSource, LeadStatus } from '@prisma/client';

@UseGuards(AuthGuard('jwt'))
@Controller('lead')
export class LeadController {
  constructor(private readonly leadService: LeadService) {}

  @Post()
  create(@Body() dto: CreateLeadDto, @Req() req) {
    return this.leadService.create(dto, req.user.companyId);
  }

  @Get()
  findAll(
    @Req() req,
    @Query('source') source?: LeadSource,
    @Query('projectId') projectId?: string,
    @Query('status') status?: LeadStatus,
  ) {
    return this.leadService.findAll(req.user.companyId, {
      source,
      projectId,
      status,
    });
  }

  @Get('kanban')
  getKanban(
    @Req() req,
    @Query('source') source?: LeadSource,
    @Query('projectId') projectId?: string,
  ) {
    return this.leadService.getKanban(req.user.companyId, {
      source,
      projectId,
    });
  }

  @Get('sources/summary')
  sourceSummary(@Req() req, @Query('projectId') projectId?: string) {
    return this.leadService.getSourceSummary(req.user.companyId, projectId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    return this.leadService.findOne(id, req.user.companyId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateLeadDto, @Req() req) {
    return this.leadService.update(id, dto, req.user.companyId);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: LeadStatus,
    @Req() req,
  ) {
    return this.leadService.updateStatus(id, status, req.user.companyId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    return this.leadService.remove(id, req.user.companyId);
  }
}
