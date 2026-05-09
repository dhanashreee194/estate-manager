import { IsEmail, IsEnum, IsString } from 'class-validator';

export enum InviteRole {
  SALES = 'SALES',
  ACCOUNTANT = 'ACCOUNTANT',
}

export class InviteUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsEnum(InviteRole)
  role: InviteRole;
}
