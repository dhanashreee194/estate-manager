import { IsBoolean, IsNumber, IsOptional } from 'class-validator';

export class UpdateAttendanceDto {
  @IsOptional()
  @IsBoolean()
  present?: boolean;

  @IsOptional()
  @IsNumber()
  wageForDay?: number;
}
