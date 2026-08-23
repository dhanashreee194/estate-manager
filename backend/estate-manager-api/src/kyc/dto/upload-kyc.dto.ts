import { IsEnum, IsOptional, IsString } from 'class-validator';
import { KycType } from '@prisma/client';

export class UploadKycDto {
  @IsEnum(KycType)
  type: KycType;

  @IsOptional()
  @IsString()
  number?: string;

  @IsString()
  fileUrl: string;
}
