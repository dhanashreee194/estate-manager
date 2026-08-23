import { IsEnum, IsOptional, IsString } from 'class-validator';

import { DocumentEntityType } from '@prisma/client';

export class UploadDocumentDto {
  @IsEnum(DocumentEntityType)
  entityType: DocumentEntityType;

  @IsString()
  entityId: string;

  @IsString()
  type: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsString()
  url: string;
}
