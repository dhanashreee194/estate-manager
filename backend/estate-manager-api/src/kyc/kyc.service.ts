import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UploadKycDto } from './dto/upload-kyc.dto';

@Injectable()
export class KycService {
  constructor(private prisma: PrismaService) {}

  // Upload KYC document
  async upload(customerId: string, dto: UploadKycDto) {
    return this.prisma.kycDocument.create({
      data: {
        customerId,
        type: dto.type,
        number: dto.number,
        fileUrl: dto.fileUrl,
      },
    });
  }

  // Get all KYC docs for customer
  async getCustomerKyc(customerId: string) {
    return this.prisma.kycDocument.findMany({
      where: {
        customerId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Verify KYC
  async verify(id: string, userId: string, verified: boolean) {
    const existing = await this.prisma.kycDocument.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('KYC document not found');
    }

    return this.prisma.kycDocument.update({
      where: { id },
      data: {
        verified,
        verifiedBy: userId,
        verifiedAt: new Date(),
      },
    });
  }

  // Delete KYC document
  async delete(id: string) {
    return this.prisma.kycDocument.delete({
      where: { id },
    });
  }
}
