import { Module } from '@nestjs/common';
import { AttachmentsService } from './attachments.service';
import { AttachmentsController } from './attachments.controller';
import { LogsModule } from '../logs/logs.module'; 

@Module({
  imports: [LogsModule], 
  controllers: [AttachmentsController],
  providers: [AttachmentsService],
})
export class AttachmentsModule {}