import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UploadDocumentDto } from './dto/upload-document.dto';

@Injectable()
export class DocumentService {
  constructor(private prisma: PrismaService) {}

  // Upload document
  async upload(dto: UploadDocumentDto) {
    return this.prisma.document.create({
      data: {
        entityType: dto.entityType,
        entityId: dto.entityId,
        type: dto.type,
        name: dto.name,
        url: dto.url,
      },
    });
  }

  // Get documents by entity
  async getDocuments(entityType: string, entityId: string) {
    return this.prisma.document.findMany({
      where: {
        entityType: entityType as any,
        entityId,
      },
      orderBy: {
        uploadedAt: 'desc',
      },
    });
  }

  // Delete document
  async delete(id: string) {
    return this.prisma.document.delete({
      where: { id },
    });
  }
}
