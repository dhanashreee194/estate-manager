import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { LandAcquisitionType, LandParcelStatus } from '@prisma/client';

export class CreateLandParcelDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsString()
  surveyNumber?: string;

  @IsOptional()
  @IsString()
  gatNumber?: string;

  @IsOptional()
  @IsString()
  village?: string;

  @IsOptional()
  @IsString()
  taluka?: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsNumber()
  areaSqFt?: number;

  @IsOptional()
  @IsNumber()
  areaAcres?: number;

  @IsOptional()
  @IsEnum(LandAcquisitionType)
  acquisitionType?: LandAcquisitionType;

  @IsOptional()
  @IsEnum(LandParcelStatus)
  status?: LandParcelStatus;

  @IsOptional()
  @IsNumber()
  purchasePrice?: number;

  @IsOptional()
  @IsString()
  agreementDate?: string;

  @IsOptional()
  @IsString()
  registrationDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateLandParcelDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  projectId?: string | null;

  @IsOptional()
  @IsString()
  surveyNumber?: string;

  @IsOptional()
  @IsString()
  gatNumber?: string;

  @IsOptional()
  @IsString()
  village?: string;

  @IsOptional()
  @IsString()
  taluka?: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsNumber()
  areaSqFt?: number;

  @IsOptional()
  @IsNumber()
  areaAcres?: number;

  @IsOptional()
  @IsEnum(LandAcquisitionType)
  acquisitionType?: LandAcquisitionType;

  @IsOptional()
  @IsEnum(LandParcelStatus)
  status?: LandParcelStatus;

  @IsOptional()
  @IsNumber()
  purchasePrice?: number;

  @IsOptional()
  @IsString()
  agreementDate?: string | null;

  @IsOptional()
  @IsString()
  registrationDate?: string | null;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateLandPaymentDto {
  @IsString()
  landParcelId: string;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  partnerId?: string;

  @IsOptional()
  @IsString()
  date?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsOptional()
  @IsString()
  bankAccountId?: string;
}
