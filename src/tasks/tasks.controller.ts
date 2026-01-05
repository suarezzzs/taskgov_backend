import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('tasks')
@UseGuards(AuthGuard('jwt'))
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(@Body() body: any) { return this.tasksService.create(body); }

  @Get('workspace/:workspaceId')
  findAllByWorkspace(@Param('workspaceId') workspaceId: string) { return this.tasksService.findAllByWorkspace(workspaceId); }

  @Get(':id/details')
  findOne(@Param('id') id: string) { return this.tasksService.findOneWithDetails(id); }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) { return this.tasksService.update(id, body); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.tasksService.remove(id); }

  @Post(':id/checklist')
  addChecklist(@Param('id') id: string, @Body() body: { title: string }, @Request() req: any) {
    return this.tasksService.addChecklistItem(id, body.title, req.user.userId);
  }

  @Patch('checklist/:itemId')
  toggleChecklist(@Param('itemId') itemId: string, @Body() body: { isCompleted: boolean }, @Request() req: any) {
    return this.tasksService.toggleChecklistItem(itemId, body.isCompleted, req.user.userId);
  }
}