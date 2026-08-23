import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

import { PaymentMode } from '@prisma/client';

export class CreatePaymentDto {
  @IsString()
  bookingId: string;

  @IsNumber()
  amount: number;

  @IsString()
  stage: string;

  @IsEnum(PaymentMode)
  mode: PaymentMode;

  @IsOptional()
  @IsString()
  remarks?: string;

  @IsOptional()
  @IsString()
  installmentId?: string;

  @IsOptional()
  @IsString()
  bankAccountId?: string;
}

export class UpdatePaymentDto {
  @IsOptional()
  @IsString()
  remarks?: string;
}
