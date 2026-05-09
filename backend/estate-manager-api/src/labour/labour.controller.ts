import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LabourService } from './labour.service';
import { CreateLabourDto } from './dto/create-labour.dto';
import { AssignLabourDto } from './dto/assign-labour.dto';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('labour')
export class LabourController {
  constructor(private readonly labourService: LabourService) {}

  // Create labour
  @Post()
  createLabour(@Body() dto: CreateLabourDto, @Req() req) {
    console.log('companyId from token:', req.user.companyId);
    return this.labourService.createLabour(dto, req.user.companyId);
  }
  // ✅ GET ALL LABOURS (🔥 MISSING API)
  @Get()
  getLabours(@Req() req) {
    return this.labourService.getLabours(req.user.companyId);
  }

  // Assign labour to project
  @Post('assign')
  assign(@Body() dto: AssignLabourDto, @Req() req) {
    return this.labourService.assignLabour(dto, req.user.companyId);
  }

  // Mark attendance
  @Post('attendance')
  mark(@Body() dto: MarkAttendanceDto, @Req() req) {
    return this.labourService.markAttendance(dto, req.user.companyId);
  }

  // Get attendance by project
  @Get('attendance/:projectId')
  getAttendance(@Param('projectId') projectId: string, @Req() req) {
    return this.labourService.getProjectAttendance(
      projectId,
      req.user.companyId,
    );
  }

  @Get('assigned/:projectId')
  getAssignedLabours(@Param('projectId') projectId: string, @Req() req) {
    return this.labourService.getAssignedLabours(projectId, req.user.companyId);
  }

  @Delete('assign/:id')
  removeAssignment(@Param('id') id: string, @Req() req) {
    return this.labourService.removeAssignment(id, req.user.companyId);
  }

  @Patch('attendance/:id')
  updateAttendance(
    @Param('id') id: string,
    @Body() dto: UpdateAttendanceDto,
    @Req() req,
  ) {
    return this.labourService.updateAttendance(id, dto, req.user.companyId);
  }

  @Delete('attendance/:id')
  deleteAttendance(@Param('id') id: string, @Req() req) {
    return this.labourService.deleteAttendance(id, req.user.companyId);
  }
}
