import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CompanyService } from './company.service';
import { UpdateCompanyDto } from './dto/update-company.dto';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Get('me')
  @Roles('ADMIN', 'SUPERVISOR', 'SALES', 'ACCOUNTANT')
  getMe(@Req() req) {
    return this.companyService.getMyCompany(req.user.companyId);
  }

  @Patch('me')
  @Roles('ADMIN')
  updateMe(@Req() req, @Body() dto: UpdateCompanyDto) {
    return this.companyService.updateMyCompany(
      req.user.companyId,
      req.user.role,
      dto,
    );
  }

  @Post('logo')
  @Roles('ADMIN')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (_req, file, cb) => {
          const ext = extname(file.originalname) || '.png';
          cb(null, `company-logo-${Date.now()}${ext}`);
        },
      }),
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype?.startsWith('image/')) {
          return cb(
            new BadRequestException('Only image files are allowed') as any,
            false,
          );
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async uploadLogo(@UploadedFile() file: Express.Multer.File, @Req() req) {
    if (!file) throw new BadRequestException('No image uploaded');
    const logoUrl = `/uploads/${file.filename}`;
    return this.companyService.setLogo(
      req.user.companyId,
      req.user.role,
      logoUrl,
    );
  }
}
