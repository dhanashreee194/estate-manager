import { IsEnum, IsNumber, IsString } from 'class-validator';

export enum MaterialUnitEnum {
  BAG = 'BAG',
  KG = 'KG',
  TON = 'TON',
  PIECE = 'PIECE',
  LITER = 'LITER',
  BRASS = 'BRASS',
}

export class CreateMaterialDto {
  @IsString()
  name: string;

  @IsEnum(MaterialUnitEnum)
  unit: MaterialUnitEnum;

  @IsNumber()
  unitCost: number;
}

export class UpdateMaterialDto {
  @IsString()
  name: string;

  @IsEnum(MaterialUnitEnum)
  unit: MaterialUnitEnum;

  @IsNumber()
  unitCost: number;
}

export class DeleteMaterialDto {
  @IsString()
  id: string;
}

export class GetMaterialDto {
  @IsString()
  id: string;
}
