import { Inject, Injectable } from '@nestjs/common';
import { CreateChecklistDto } from './dto/create-checklist.dto';
import { DRIZZLE } from '../database/database.module';
import { checklists } from '../database/schema'; 
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../database/schema';
import { eq } from 'drizzle-orm';
import { LogsService } from '../logs/logs.service'; 

@Injectable()
export class ChecklistsService {
  constructor(
    @Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>,
    private readonly logsService: LogsService, 
  ) {}

  async create(createChecklistDto: CreateChecklistDto) {
    const [newItem] = await this.db
      .insert(checklists)
      .values({
        title: createChecklistDto.title,
        taskId: createChecklistDto.taskId,
        isCompleted: false, 
      })
      .returning();
    return newItem;
  }

  async findAllByTask(taskId: string) {
    return this.db
      .select()
      .from(checklists)
      .where(eq(checklists.taskId, taskId));
  }

  remove(id: string) {
    return this.db.delete(checklists).where(eq(checklists.id, id)).returning();
  }

  async updateStatus(id: string, isDone: boolean, userId: string) {
    const [updatedItem] = await this.db
      .update(checklists)
      .set({ isCompleted: isDone })
      .where(eq(checklists.id, id))
      .returning();

    if (updatedItem) {
      if (userId) {
        await this.logsService.create({
          taskId: updatedItem.taskId,
          userId: userId,
          action: isDone ? 'CHECK_ITEM_DONE' : 'CHECK_ITEM_UNDONE',
          details: `Item "${updatedItem.title}" was marked as ${isDone ? 'Done' : 'Pending'}.`,
        });
      }
    }

    return updatedItem;
  }
}