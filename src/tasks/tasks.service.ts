import { Inject, Injectable } from '@nestjs/common';
import { DRIZZLE } from '../database/database.module';
import { tasks, checklists, attachments, systemLogs } from '../database/schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../database/schema';
import { eq, desc } from 'drizzle-orm';
import { LogsService } from '../logs/logs.service';

@Injectable()
export class TasksService {
  constructor(
    @Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>,
    private readonly logsService: LogsService, 
  ) {}

  async addChecklistItem(taskId: string, title: string, userId: string) {
    const [newItem] = await this.db.insert(checklists).values({ 
      title, 
      taskId, 
      isCompleted: false 
    }).returning();

    await this.logsService.create({
      taskId,
      userId,
      action: 'CHECK_ITEM_ADD',
      details: `Added item "${title}" to the list.`,
    });

    return newItem; 
  }

  async toggleChecklistItem(itemId: string, isCompleted: boolean, userId: string) {
    const [updatedItem] = await this.db.update(checklists)
      .set({ isCompleted })
      .where(eq(checklists.id, itemId))
      .returning();

    if (updatedItem) {
      await this.logsService.create({
        taskId: updatedItem.taskId,
        userId,
        action: isCompleted ? 'CHECK_ITEM_DONE' : 'CHECK_ITEM_UNDONE',
        details: `Marked "${updatedItem.title}" as ${isCompleted ? 'completed' : 'pending'}.`,
      });
    }

    return updatedItem;
  }
  
  async create(data: { title: string; description?: string; priority: 'LOW'|'MEDIUM'|'HIGH'; workspaceId: string }) {
    const [newTask] = await this.db.insert(tasks).values({
      title: data.title,
      description: data.description,
      priority: data.priority,
      status: 'TODO',
      workspaceId: data.workspaceId,
    }).returning();
    return newTask;
  }

  async findAllByWorkspace(workspaceId: string) {
    return this.db.select().from(tasks).where(eq(tasks.workspaceId, workspaceId)).orderBy(desc(tasks.createdAt));
  }

  async findOneWithDetails(taskId: string) {
    const [task] = await this.db.select().from(tasks).where(eq(tasks.id, taskId));
    if (!task) return null;
    const taskChecklists = await this.db.select().from(checklists).where(eq(checklists.taskId, taskId));
    const taskAttachments = await this.db.select().from(attachments).where(eq(attachments.taskId, taskId));
    return { ...task, checklists: taskChecklists, attachments: taskAttachments };
  }

  async update(id: string, updates: Partial<typeof tasks.$inferSelect>) {
    const [updatedTask] = await this.db.update(tasks).set(updates).where(eq(tasks.id, id)).returning();  
    return updatedTask;
  }

  async remove(id: string) {
    await this.db.delete(checklists).where(eq(checklists.taskId, id));
    await this.db.delete(attachments).where(eq(attachments.taskId, id));
    
    await this.db.delete(systemLogs).where(eq(systemLogs.taskId, id));

    const [deletedTask] = await this.db.delete(tasks).where(eq(tasks.id, id)).returning();  
    return deletedTask;
  }
}