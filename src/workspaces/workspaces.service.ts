import { 
  Inject, 
  Injectable, 
  NotFoundException, 
  ConflictException, 
  ForbiddenException, 
  BadRequestException 
} from '@nestjs/common';
import { DRIZZLE } from '../database/database.module';
import { workspaces, workspaceMembers, tasks, checklists, attachments, users, systemLogs } from '../database/schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, inArray, and } from 'drizzle-orm';
import * as schema from '../database/schema';

@Injectable()
export class WorkspacesService {
  constructor(
    @Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async create(userId: string, name: string) {
    const [newWorkspace] = await this.db.insert(workspaces).values({
      name,
      ownerId: userId,
    }).returning();

    await this.db.insert(workspaceMembers).values({
      userId,
      workspaceId: newWorkspace.id,
      role: 'ADMIN',
    });

    return newWorkspace;
  }

  async findAllMyWorkspaces(userId: string) {
    const members = await this.db
      .select()
      .from(workspaceMembers)
      .where(eq(workspaceMembers.userId, userId));
    
    const workspaceIds = members.map(m => m.workspaceId);

    if (workspaceIds.length === 0) return [];

    return this.db
      .select()
      .from(workspaces)
      .where(inArray(workspaces.id, workspaceIds));
  }

  async remove(workspaceId: string, userId: string) {
    const [workspace] = await this.db
      .select()
      .from(workspaces)
      .where(eq(workspaces.id, workspaceId));

    if (!workspace || workspace.ownerId !== userId) {
      throw new ForbiddenException('Only the owner can delete this workspace.');
    }

    await this.db.delete(workspaceMembers).where(eq(workspaceMembers.workspaceId, workspaceId));

    const projectTasks = await this.db
      .select()
      .from(tasks)
      .where(eq(tasks.workspaceId, workspaceId));
    
    const taskIds = projectTasks.map(t => t.id);

    if (taskIds.length > 0) {
        await this.db.delete(checklists).where(inArray(checklists.taskId, taskIds));
        await this.db.delete(attachments).where(inArray(attachments.taskId, taskIds));
        
        await this.db.delete(systemLogs).where(inArray(systemLogs.taskId, taskIds));

        await this.db.delete(tasks).where(inArray(tasks.id, taskIds));
    }

    return this.db.delete(workspaces).where(eq(workspaces.id, workspaceId)).returning();
  }

  async inviteMember(workspaceId: string, email: string, ownerId: string) {
    const [workspace] = await this.db.select().from(workspaces).where(eq(workspaces.id, workspaceId));
    
    if (!workspace || workspace.ownerId !== ownerId) {
       throw new ForbiddenException('Workspace not found or you do not have permission.');
    }

    const [userToAdd] = await this.db.select().from(users).where(eq(users.email, email));
    
    if (!userToAdd) {
      throw new NotFoundException('User not found with this email.');
    }

    const [existingMember] = await this.db.select().from(workspaceMembers).where(
      and(
        eq(workspaceMembers.workspaceId, workspaceId),
        eq(workspaceMembers.userId, userToAdd.id)
      )
    );

    if (existingMember) {
      throw new ConflictException('This user is already a member of the workspace.');
    }

    await this.db.insert(workspaceMembers).values({
      userId: userToAdd.id,
      workspaceId: workspaceId,
      role: 'MEMBER',
    });

    return { message: `User ${userToAdd.name} added successfully!` };
  }

  async getMembers(workspaceId: string) {
    return this.db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: workspaceMembers.role,
      })
      .from(workspaceMembers)
      .innerJoin(users, eq(workspaceMembers.userId, users.id))
      .where(eq(workspaceMembers.workspaceId, workspaceId));
  }

  async removeMember(workspaceId: string, memberId: string, ownerId: string) {
    const [workspace] = await this.db
      .select()
      .from(workspaces)
      .where(eq(workspaces.id, workspaceId));
    
    if (!workspace) throw new NotFoundException('Workspace not found');

    if (workspace.ownerId !== ownerId) {
      throw new ForbiddenException('Only the owner can remove members');
    }

    if (memberId === ownerId) {
       throw new BadRequestException('The owner cannot be removed from the member list');
    }

    const deleted = await this.db.delete(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.workspaceId, workspaceId),
          eq(workspaceMembers.userId, memberId)
        )
      )
      .returning();

    if (deleted.length === 0) {
        throw new NotFoundException('Member not found in this workspace');
    }

    return { message: 'Member removed successfully' };
  }
}