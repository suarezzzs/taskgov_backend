import { Inject, Injectable } from '@nestjs/common';
import { DRIZZLE } from '../database/database.module';
import { systemLogs } from '../database/schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../database/schema';
import { eq, desc } from 'drizzle-orm';

@Injectable()
export class LogsService {
  constructor(
    @Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async create(data: { taskId: string; userId: string; action: string; details: string }) {
    return this.db.insert(systemLogs).values({
      taskId: data.taskId,
      userId: data.userId,
      action: data.action,
      details: data.details,
    }).returning();
  }

  async findByTask(taskId: string) {
    return this.db.select({
      id: systemLogs.id,
      action: systemLogs.action,
      details: systemLogs.details,
      createdAt: systemLogs.createdAt,
      userName: schema.users.name, 
    })
    .from(systemLogs)
    .leftJoin(schema.users, eq(systemLogs.userId, schema.users.id))
    .where(eq(systemLogs.taskId, taskId))
    .orderBy(desc(systemLogs.createdAt));
  }
}