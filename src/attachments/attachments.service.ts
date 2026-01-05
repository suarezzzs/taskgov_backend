import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DRIZZLE } from '../database/database.module';
import { attachments, systemLogs } from '../database/schema'; 
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../database/schema';
import { eq } from 'drizzle-orm';
import { LogsService } from '../logs/logs.service';
import * as fs from 'fs';

@Injectable()
export class AttachmentsService {
  constructor(
    @Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>,
    private readonly logsService: LogsService, 
  ) {}

  async create(file: Express.Multer.File, taskId: string, userId: string) {
    const [newAttachment] = await this.db
      .insert(attachments)
      .values({
        taskId: taskId,
        fileName: file.originalname,
        filePath: file.path,
      })
      .returning();

    await this.logsService.create({
      taskId,
      userId,
      action: 'ATTACHMENT_UPLOAD',
      details: `Uploaded file "${file.originalname}".`,
    });

    return newAttachment;
  }

  async findOne(id: string) {
    const [attachment] = await this.db.select().from(attachments).where(eq(attachments.id, id));
    return attachment;
  }

  async remove(attachmentId: string, userId: string) {
    const [attachment] = await this.db
      .select()
      .from(attachments)
      .where(eq(attachments.id, attachmentId));

    if (!attachment) {
      throw new NotFoundException('File not found.');
    }

    try {
      if (fs.existsSync(attachment.filePath)) {
        fs.unlinkSync(attachment.filePath);
      }
    } catch (error) {
      console.error("Error deleting physical file:", error);
    }

    await this.db.insert(systemLogs).values({
      action: 'ATTACHMENT_REMOVE',
      details: `File ${attachment.fileName} removed`,
      taskId: attachment.taskId,
      userId: userId,
    });

    await this.db.delete(attachments).where(eq(attachments.id, attachmentId));

    return { message: 'File removed successfully' };
  }
}