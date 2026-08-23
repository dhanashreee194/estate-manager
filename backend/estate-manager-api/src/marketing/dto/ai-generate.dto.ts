import { IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class AiGenerateDto {
  @IsUUID()
  projectId: string;

  @IsOptional()
  @IsUUID()
  unitId?: string;

  /** Free-form instructions / comments for the AI */
  @IsString()
  @MinLength(3)
  comments: string;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsString()
  headline?: string;

  @IsOptional()
  @IsString()
  body?: string;
}
