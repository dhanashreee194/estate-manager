import { IsBoolean } from 'class-validator';

export class VerifyKycDto {
  @IsBoolean()
  verified: boolean;
}
