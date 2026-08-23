import { IsEmail, IsIn, IsString } from 'class-validator';
import { INVITABLE_ROLES } from '../app-roles';

export class InviteUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsIn([...INVITABLE_ROLES])
  role: string;
}
