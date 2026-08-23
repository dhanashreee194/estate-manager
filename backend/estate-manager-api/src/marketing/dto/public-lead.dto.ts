import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { LeadSource } from '@prisma/client';

export class PublicLeadDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @MinLength(7)
  phone: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsEnum(LeadSource)
  source?: LeadSource;
}
