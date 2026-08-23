import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DocumentService } from './document.service';
import { UploadDocumentDto } from './dto/upload-document.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('documents')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  // Upload document
  @Post()
  upload(@Body() dto: UploadDocumentDto) {
    return this.documentService.upload(dto);
  }

  // Get documents
  @Get()
  getDocuments(
    @Query('entityType') entityType: string,
    @Query('entityId') entityId: string,
  ) {
    return this.documentService.getDocuments(entityType, entityId);
  }

  // Delete document
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.documentService.delete(id);
  }
}
