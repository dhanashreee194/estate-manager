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
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  // Create customer
  @Post()
  create(@Body() dto: CreateCustomerDto, @Req() req) {
    return this.customerService.createCustomer(dto, req.user.companyId);
  }

  // List all customers
  @Get()
  findAll(@Req() req, @Query('search') search?: string) {
    return this.customerService.getCustomers(req.user.companyId, search);
  }

  // Get single customer
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    return this.customerService.getCustomerById(id, req.user.companyId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: CreateCustomerDto, @Req() req) {
    return this.customerService.updateCustomer(id, dto, req.user.companyId);
  }
}
