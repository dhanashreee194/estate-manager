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
import { BrokerService } from './broker.service';
import { CreateBrokerDto } from './dto/create-broker.dto';
import { UpdateBrokerDto } from './dto/update-broker.dto';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('ADMIN', 'SALES', 'ACCOUNTANT')
@Controller('brokers')
export class BrokerController {
  constructor(private readonly brokerService: BrokerService) {}

  @Post()
  create(@Body() dto: CreateBrokerDto, @Req() req) {
    return this.brokerService.create(dto, req.user.companyId);
  }

  @Get()
  findAll(@Req() req, @Query('all') all?: string) {
    return this.brokerService.findAll(req.user.companyId, all !== '1');
  }

  @Get('commissions/summary')
  commissionSummary(@Req() req) {
    return this.brokerService.getCommissionSummary(req.user.companyId);
  }

  @Get('commissions')
  commissions(
    @Req() req,
    @Query('status') status?: string,
    @Query('brokerId') brokerId?: string,
  ) {
    return this.brokerService.getCommissions(req.user.companyId, {
      status,
      brokerId,
    });
  }

  @Post('commissions/:id/pay')
  markPaid(@Param('id') id: string, @Body() body: any, @Req() req) {
    return this.brokerService.markCommissionPaid(id, req.user.companyId, body);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    return this.brokerService.findOne(id, req.user.companyId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBrokerDto, @Req() req) {
    return this.brokerService.update(id, dto, req.user.companyId);
  }

  @Delete(':id')
  deactivate(@Param('id') id: string, @Req() req) {
    return this.brokerService.deactivate(id, req.user.companyId);
  }
}
