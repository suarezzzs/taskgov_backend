import { Controller, Post, Body, UseGuards, Get, Param, Delete, Patch, Request } from '@nestjs/common';
import { ChecklistsService } from './checklists.service';
import { CreateChecklistDto } from './dto/create-checklist.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('checklists')
export class ChecklistsController {
  constructor(private readonly checklistsService: ChecklistsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(@Body() createChecklistDto: CreateChecklistDto) {
    return this.checklistsService.create(createChecklistDto);
  }

  @Get(':taskId')
  @UseGuards(AuthGuard('jwt'))
  findAll(@Param('taskId') taskId: string) {
    return this.checklistsService.findAllByTask(taskId);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  remove(@Param('id') id: string) {
    return this.checklistsService.remove(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  updateStatus(
    @Param('id') id: string,
    @Body('isDone') isDone: boolean,
    @Request() req: any,
  ) {
    return this.checklistsService.updateStatus(id, isDone, req.user.userId);
  }
}