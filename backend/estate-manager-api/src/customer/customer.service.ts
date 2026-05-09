import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';

@Injectable()
export class CustomerService {
  constructor(private prisma: PrismaService) {}

  // Create customer (COMPANY SAFE)
  async createCustomer(dto: CreateCustomerDto, companyId: string) {
    // Optional: prevent duplicate phone per company
    const existing = await this.prisma.customer.findFirst({
      where: {
        phone: dto.phone,
        companyId,
      },
    });

    if (existing) {
      throw new BadRequestException('Customer already exists');
    }

    return this.prisma.customer.create({
      data: {
        name: dto.name,
        phone: dto.phone,
        email: dto.email,
        address: dto.address,
        company: {
          connect: { id: companyId },
        },
      },
    });
  }

  // List customers for company
  getCustomers(companyId: string) {
    return this.prisma.customer.findMany({
      where: {
        companyId,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  // Get single customer (COMPANY SAFE)
  getCustomerById(customerId: string, companyId: string) {
    return this.prisma.customer.findFirst({
      where: {
        id: customerId,
        companyId,
      },
      include: {
        bookings: true,
      },
    });
  }

  async updateCustomer(id: string, dto: CreateCustomerDto, companyId: string) {
    const existing = await this.prisma.customer.findFirst({
      where: { id, companyId },
    });

    if (!existing) {
      throw new BadRequestException('Customer not found');
    }

    return this.prisma.customer.update({
      where: { id },
      data: {
        name: dto.name,
        phone: dto.phone,
        email: dto.email,
        address: dto.address,
      },
    });
  }
}
