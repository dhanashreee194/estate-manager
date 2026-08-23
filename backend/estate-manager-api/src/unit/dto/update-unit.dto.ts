import { UnitStatus } from '@prisma/client';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export enum UnitType {
  PLOT = 'PLOT',
  FLAT = 'FLAT',
  ROW_HOUSE = 'ROW_HOUSE',
  VILLA = 'VILLA',
}

export class UpdateUnitDto {
  @IsOptional()
  @IsString()
  unitNumber?: string;

  @IsOptional()
  @IsNumber()
  areaSqFt?: number;

  @IsOptional()
  @IsNumber()
  basePrice?: number;

  @IsOptional()
  @IsString()
  direction?: string;

  @IsOptional()
  @IsNumber()
  floor?: number;

  @IsOptional()
  @IsString()
  status?: UnitStatus;

  @IsOptional()
  @IsString()
  bhkType?: string;

  @IsOptional()
  @IsUUID()
  wingId?: string;

  @IsOptional()
  @IsNumber()
  layoutRow?: number | null;

  @IsOptional()
  @IsNumber()
  layoutCol?: number | null;
}
