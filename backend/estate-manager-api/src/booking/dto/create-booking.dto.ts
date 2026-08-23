import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateBookingDto {
  @IsString()
  unitId: string;

  @IsString()
  projectId: string;

  // Customer
  @IsString()
  name: string;

  @IsString()
  phone: string;

  email?: string;
  address?: string;

  // Channel partner / broker
  @IsOptional()
  @IsString()
  brokerId?: string;

  /** Optional override; defaults to broker.commissionRate */
  @IsOptional()
  @IsNumber()
  commissionRate?: number;

  // Builder
  @IsNumber()
  builtUpSqft: number;

  @IsNumber()
  marketRate: number;

  @IsNumber()
  gstAmount: number;

  @IsNumber()
  maintenanceFee: number;

  @IsNumber()
  advocateFee: number;

  @IsNumber()
  mecbFee: number;

  @IsNumber()
  oneTimeMaint: number;

  // Govt
  @IsNumber()
  govtSqMeter: number;

  @IsNumber()
  govtValue: number;

  @IsNumber()
  stampDuty: number;

  @IsNumber()
  registrationFee: number;

  // Totals
  @IsNumber()
  totalPrice: number;

  @IsNumber()
  govtAmount: number;

  @IsNumber()
  cashAmount: number;
}
