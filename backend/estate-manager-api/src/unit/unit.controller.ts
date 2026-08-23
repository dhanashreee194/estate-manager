import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UnitService } from './unit.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { Roles } from 'src/auth/roles.decorator';
import { CreateBulkFlatsDto } from './dto/create-bulk-flats.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('unit')
export class UnitController {
  constructor(private readonly unitService: UnitService) {}

  @Post()
  @Roles('ADMIN')
  create(@Body() dto: CreateUnitDto, @Req() req) {
    return this.unitService.createUnit(dto, req.user.companyId);
  }

  @Get('project/:projectId')
  @Roles('ADMIN', 'SALES')
  getUnits(@Param('projectId') projectId: string, @Req() req) {
    return this.unitService.getUnitsByProject(projectId, req.user.companyId);
  }

  @Get('project/:projectId/layout')
  @Roles('ADMIN', 'SALES')
  getLayout(@Param('projectId') projectId: string, @Req() req) {
    return this.unitService.getLayoutMap(projectId, req.user.companyId);
  }

  @Put('project/:projectId/layout-config')
  @Roles('ADMIN')
  updateLayoutConfig(
    @Param('projectId') projectId: string,
    @Body() body: any,
    @Req() req,
  ) {
    return this.unitService.updateLayoutConfig(
      projectId,
      req.user.companyId,
      body,
    );
  }

  @Post('project/:projectId/layout-image')
  @Roles('ADMIN')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req: any, file, cb) => {
          const ext = extname(file.originalname) || '.png';
          cb(null, `layout-${req.params.projectId}-${Date.now()}${ext}`);
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
      limits: { fileSize: 12 * 1024 * 1024 },
    }),
  )
  async uploadLayoutImage(
    @Param('projectId') projectId: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req,
  ) {
    if (!file) throw new BadRequestException('No image uploaded');
    const layoutImageUrl = `/uploads/${file.filename}`;
    return this.unitService.updateLayoutConfig(
      projectId,
      req.user.companyId,
      { layoutImageUrl },
    );
  }

  @Delete('project/:projectId/layout-image')
  @Roles('ADMIN')
  clearLayoutImage(@Param('projectId') projectId: string, @Req() req) {
    return this.unitService.updateLayoutConfig(
      projectId,
      req.user.companyId,
      { layoutImageUrl: null },
    );
  }

  @Post('project/:projectId/layout/auto-arrange')
  @Roles('ADMIN')
  autoArrange(@Param('projectId') projectId: string, @Req() req) {
    return this.unitService.autoArrangeLayout(projectId, req.user.companyId);
  }

  @Get('project/:projectId/available')
  @Roles('ADMIN', 'SALES')
  getAvailable(@Param('projectId') projectId: string, @Req() req) {
    return this.unitService.getAvailableUnits(projectId, req.user.companyId);
  }

  @Post('bulk/flats')
  @Roles('ADMIN')
  createBulkFlats(@Body() dto: CreateBulkFlatsDto, @Req() req) {
    return this.unitService.createBulkFlats(dto, req.user.companyId);
  }

  @Put(':id/place')
  @Roles('ADMIN', 'SALES')
  place(
    @Param('id') unitId: string,
    @Body() body: { layoutRow: number | null; layoutCol: number | null },
    @Req() req,
  ) {
    return this.unitService.placeUnit(
      unitId,
      req.user.companyId,
      body.layoutRow ?? null,
      body.layoutCol ?? null,
    );
  }

  @Put(':id')
  @Roles('ADMIN', 'SALES')
  update(@Param('id') unitId: string, @Body() dto: UpdateUnitDto, @Req() req) {
    return this.unitService.updateUnit(unitId, dto, req.user.companyId);
  }

  @Get('wing/:wingId')
  @Roles('ADMIN', 'SALES')
  getByWing(@Param('wingId') wingId: string, @Req() req) {
    return this.unitService.getUnitsByWing(wingId, req.user.companyId);
  }
}
