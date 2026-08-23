import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { CashbookCategory, CashbookEntryType } from '@prisma/client';

export class CreateCashbookEntryDto {
  @IsString()
  bankAccountId: string;

  @IsEnum(CashbookEntryType)
  type: CashbookEntryType;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsEnum(CashbookCategory)
  category?: CashbookCategory;

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
  projectId?: string;
}
