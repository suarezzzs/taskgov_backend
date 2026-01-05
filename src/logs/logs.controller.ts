import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { LogsService } from './logs.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('logs')
@UseGuards(AuthGuard('jwt'))
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Get('task/:taskId')
  async getTaskLogs(@Param('taskId') taskId: string) {
    return this.logsService.findByTask(taskId);
  }
}