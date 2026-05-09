import { IsOptional, IsString, IsBoolean, IsNumber } from 'class-validator';

export class UpdateWingDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  totalFloors?: number;

  @IsOptional()
  @IsNumber()
  flatsPerFloor?: number;

  @IsOptional()
  @IsBoolean()
  hasLift?: boolean;

  @IsOptional()
  @IsNumber()
  liftsCount?: number;
}
