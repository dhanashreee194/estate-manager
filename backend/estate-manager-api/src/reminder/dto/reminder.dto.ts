import {
  IsEnum,
  IsOptional,
  IsString,
  IsDateString,
} from 'class-validator';
import {
  ReminderChannel,
  ReminderStatus,
  ReminderType,
} from '@prisma/client';

export class CreateReminderDto {
  @IsEnum(ReminderType)
  type: ReminderType;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsDateString()
  dueAt: string;

  @IsOptional()
  @IsEnum(ReminderChannel)
  channel?: ReminderChannel;

  @IsOptional()
  @IsString()
  entityType?: string;

  @IsOptional()
  @IsString()
  entityId?: string;
}

export class UpdateReminderDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsDateString()
  dueAt?: string;

  @IsOptional()
  @IsEnum(ReminderChannel)
  channel?: ReminderChannel;

  @IsOptional()
  @IsEnum(ReminderStatus)
  status?: ReminderStatus;
}

export class MarkReminderDto {
  @IsOptional()
  @IsEnum(ReminderChannel)
  channel?: ReminderChannel;
}
