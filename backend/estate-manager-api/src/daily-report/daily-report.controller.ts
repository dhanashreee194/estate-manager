import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DailyReportService } from './daily-report.service';

@UseGuards(AuthGuard('jwt'))
@Controller('daily-report')
export class DailyReportController {
  constructor(private service: DailyReportService) {}

  @Post()
  create(@Body() body: any) {
    return this.service.createReport(
      body.projectId,
      new Date(body.date),
      body.workDetails,
      {
        siteName: body.siteName,
        meterFrom: body.meterFrom,
        meterTo: body.meterTo,
        meterUnits: body.meterUnits,
        checkedBy: body.checkedBy,
      },
    );
  }

  @Get('project/:projectId')
  getProjectReports(@Param('projectId') id: string) {
    return this.service.getProjectReports(id);
  }

  @Post(':reportId/labour')
  addLabour(@Param('reportId') id: string, @Body() body: any) {
    return this.service.addLabour(id, body);
  }

  @Post(':reportId/material')
  addMaterial(@Param('reportId') id: string, @Body() body: any) {
    return this.service.addMaterial(id, body);
  }

  @Post(':reportId/payment')
  addPayment(@Param('reportId') id: string, @Body() body: any) {
    return this.service.addPayment(id, body);
  }

  @Post(':reportId/goods')
  addGoods(@Param('reportId') id: string, @Body() body: any) {
    return this.service.addGoods(id, body);
  }

  /** Full daily sheet upsert (multi-row labour/material/payment/goods) */
  @Post(':reportId/sheet')
  saveSheet(@Param('reportId') id: string, @Body() body: any) {
    return this.service.saveSheet(id, body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.service.updateReport(id, body);
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.service.getReportById(id);
  }
}
