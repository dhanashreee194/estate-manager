import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { KycService } from './kyc.service';
import { UploadKycDto } from './dto/upload-kyc.dto';
import { VerifyKycDto } from './dto/verify-kyc.dto';

@UseGuards(AuthGuard('jwt'))
@Controller()
export class KycController {
  constructor(private readonly kycService: KycService) {}

  // Upload KYC
  @Post('customers/:customerId/kyc')
  upload(@Param('customerId') customerId: string, @Body() dto: UploadKycDto) {
    return this.kycService.upload(customerId, dto);
  }

  // Get customer KYC docs
  @Get('customers/:customerId/kyc')
  getCustomerKyc(@Param('customerId') customerId: string) {
    return this.kycService.getCustomerKyc(customerId);
  }

  // Verify KYC
  @Patch('kyc/:id/verify')
  verify(@Param('id') id: string, @Body() dto: VerifyKycDto, @Req() req) {
    return this.kycService.verify(id, req.user.id, dto.verified);
  }

  // Delete KYC
  @Delete('kyc/:id')
  remove(@Param('id') id: string) {
    return this.kycService.delete(id);
  }
}
