import {
  Body,
  Controller,
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
import { ReminderService } from './reminder.service';
import {
  CreateReminderDto,
  MarkReminderDto,
  UpdateReminderDto,
} from './dto/reminder.dto';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('ADMIN', 'SUPERVISOR', 'SALES', 'ACCOUNTANT')
@Controller('reminders')
export class ReminderController {
  constructor(private readonly reminderService: ReminderService) {}

  @Get()
  list(
    @Req() req,
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('dueOnly') dueOnly?: string,
  ) {
    return this.reminderService.list(req.user.companyId, {
      status,
      type,
      dueOnly: dueOnly === '1' || dueOnly === 'true',
    });
  }

  @Get('summary')
  summary(@Req() req) {
    return this.reminderService.summary(req.user.companyId);
  }

  @Post('generate')
  generate(@Req() req) {
    return this.reminderService.generate(req.user.companyId);
  }

  @Post()
  create(@Body() dto: CreateReminderDto, @Req() req) {
    return this.reminderService.create(
      dto,
      req.user.companyId,
      req.user.userId || req.user.id,
    );
  }

  @Get(':id/compose')
  compose(@Param('id') id: string, @Req() req) {
    return this.reminderService.compose(id, req.user.companyId);
  }

  @Post(':id/mark-sent')
  markSent(
    @Param('id') id: string,
    @Body() dto: MarkReminderDto,
    @Req() req,
  ) {
    return this.reminderService.markSent(id, req.user.companyId, dto);
  }

  @Post(':id/done')
  markDone(@Param('id') id: string, @Req() req) {
    return this.reminderService.markDone(id, req.user.companyId);
  }

  @Post(':id/skip')
  skip(@Param('id') id: string, @Req() req) {
    return this.reminderService.skip(id, req.user.companyId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateReminderDto,
    @Req() req,
  ) {
    return this.reminderService.update(id, dto, req.user.companyId);
  }
}
