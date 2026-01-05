import { 
  Controller, Post, UseInterceptors, UploadedFile, Param, UseGuards, 
  Request, Get, StreamableFile, Res, NotFoundException, Body, Delete 
} from '@nestjs/common';
import { AttachmentsService } from './attachments.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { createReadStream } from 'fs';
import type { Response } from 'express';

@Controller('attachments')
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @Post('upload')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + extname(file.originalname));
      },
    }),
  }))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { taskId: string },
    @Request() req: any, 
  ) {
    return this.attachmentsService.create(file, body.taskId, req.user.userId);
  }

  @Get('download/:id')
  @UseGuards(AuthGuard('jwt'))
  async downloadFile(@Param('id') id: string, @Res({ passthrough: true }) res: Response) {
    const fileData = await this.attachmentsService.findOne(id);
    if (!fileData) throw new NotFoundException('File not found.');
    
    const fullPath = join(process.cwd(), fileData.filePath);
    
    const fileStream = createReadStream(fullPath);
    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${fileData.fileName}"`,
    });
    return new StreamableFile(fileStream);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async remove(@Param('id') id: string, @Request() req: any) {
    return this.attachmentsService.remove(id, req.user.userId);
  }
}