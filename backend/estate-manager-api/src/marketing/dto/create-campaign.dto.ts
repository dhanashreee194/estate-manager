import { IsBoolean, IsEnum, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';
import { CampaignStatus } from '@prisma/client';

export class CreateCampaignDto {
  @IsString()
  @MinLength(2)
  title: string;

  @IsUUID()
  projectId: string;

  @IsOptional()
  @IsUUID()
  unitId?: string;

  @IsString()
  @MinLength(2)
  headline: string;

  @IsString()
  @MinLength(2)
  body: string;

  @IsOptional()
  @IsString()
  ctaLabel?: string;

  @IsOptional()
  @IsString()
  ctaPhone?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsBoolean()
  enableWhatsapp?: boolean;

  @IsOptional()
  @IsBoolean()
  enableFacebook?: boolean;

  @IsOptional()
  @IsBoolean()
  enableInstagram?: boolean;

  @IsOptional()
  @IsEnum(CampaignStatus)
  status?: CampaignStatus;
}
