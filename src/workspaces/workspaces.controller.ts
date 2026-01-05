import { Controller, Get, Post, Body, UseGuards, Request, Delete, Param } from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('workspaces')
@UseGuards(AuthGuard('jwt'))
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Post()
  create(@Request() req: any, @Body() body: { name: string }) {
    return this.workspacesService.create(req.user.userId, body.name);
  }

  @Get()
  findAll(@Request() req: any) {
    return this.workspacesService.findAllMyWorkspaces(req.user.userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.workspacesService.remove(id, req.user.userId);
  }

  @Post(':id/invite')
  invite(@Param('id') id: string, @Body() body: { email: string }, @Request() req: any) {
    return this.workspacesService.inviteMember(id, body.email, req.user.userId);
  }

  @Get(':id/members')
  getMembers(@Param('id') id: string) {
    return this.workspacesService.getMembers(id);
  }

  @Delete(':id/members/:memberId')
  removeMember(
    @Param('id') workspaceId: string, 
    @Param('memberId') memberId: string,
    @Request() req: any
  ) {
    return this.workspacesService.removeMember(workspaceId, memberId, req.user.userId);
  }
}