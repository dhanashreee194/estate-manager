import {
  IsEnum,
  IsNotEmpty,
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

export class CreateUnitDto {
  @IsUUID()
  projectId: string;

  @IsEnum(UnitType)
  unitType: UnitType;

  @IsString()
  unitNumber: string;

  @IsNumber()
  areaSqFt: number;

  @IsNumber()
  basePrice: number;

  @IsOptional()
  @IsString()
  direction?: string;

  // hierarchy
  @IsOptional()
  @IsUUID()
  buildingId?: string;

  @IsOptional()
  @IsUUID()
  wingId?: string;

  // flat
  @IsOptional()
  floor?: number;

  @IsOptional()
  bhk?: number;

  @IsOptional()
  washrooms?: number;

  // plot
  @IsOptional()
  plotLength?: number;

  @IsOptional()
  plotWidth?: number;

  @IsOptional()
  gatNumber?: string;
}
