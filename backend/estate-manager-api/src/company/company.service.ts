import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompanyService {
  constructor(private prisma: PrismaService) {}

  private assertAdmin(role: string) {
    if (role !== 'ADMIN') {
      throw new ForbiddenException('Only owner/admin can manage settings');
    }
  }

  async getMyCompany(companyId: string) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      select: {
        id: true,
        name: true,
        email: true,
        logoUrl: true,
        phone: true,
        address: true,
        gstNumber: true,
        panNumber: true,
        invoicePrefix: true,
        invoiceFooter: true,
        billTitle: true,
        showGstOnDocs: true,
        createdAt: true,
      },
    });
    if (!company) throw new NotFoundException('Company not found');
    return company;
  }

  async updateMyCompany(
    companyId: string,
    role: string,
    dto: UpdateCompanyDto,
  ) {
    this.assertAdmin(role);
    await this.getMyCompany(companyId);

    return this.prisma.company.update({
      where: { id: companyId },
      data: {
        ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
        ...(dto.phone !== undefined ? { phone: dto.phone || null } : {}),
        ...(dto.address !== undefined ? { address: dto.address || null } : {}),
        ...(dto.gstNumber !== undefined
          ? { gstNumber: dto.gstNumber || null }
          : {}),
        ...(dto.panNumber !== undefined
          ? { panNumber: dto.panNumber || null }
          : {}),
        ...(dto.invoicePrefix !== undefined
          ? { invoicePrefix: dto.invoicePrefix || 'INV' }
          : {}),
        ...(dto.invoiceFooter !== undefined
          ? { invoiceFooter: dto.invoiceFooter || null }
          : {}),
        ...(dto.billTitle !== undefined
          ? { billTitle: dto.billTitle || null }
          : {}),
        ...(dto.showGstOnDocs !== undefined
          ? { showGstOnDocs: Boolean(dto.showGstOnDocs) }
          : {}),
        ...(dto.logoUrl !== undefined ? { logoUrl: dto.logoUrl || null } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        logoUrl: true,
        phone: true,
        address: true,
        gstNumber: true,
        panNumber: true,
        invoicePrefix: true,
        invoiceFooter: true,
        billTitle: true,
        showGstOnDocs: true,
        createdAt: true,
      },
    });
  }

  async setLogo(companyId: string, role: string, logoUrl: string) {
    this.assertAdmin(role);
    if (!logoUrl) throw new BadRequestException('Logo URL required');
    return this.updateMyCompany(companyId, role, { logoUrl });
  }
}
