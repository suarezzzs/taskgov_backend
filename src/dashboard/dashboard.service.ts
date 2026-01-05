import { Inject, Injectable } from '@nestjs/common';
import { DRIZZLE } from '../database/database.module';
import { tasks, workspaces, workspaceMembers } from '../database/schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, count, and, inArray } from 'drizzle-orm';
import * as schema from '../database/schema';

@Injectable()
export class DashboardService {
  constructor(
    @Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async getOverview(userId: string) {
    const memberWorkspaces = await this.db
      .select({ id: workspaceMembers.workspaceId })
      .from(workspaceMembers)
      .where(eq(workspaceMembers.userId, userId));

    const workspaceIds = memberWorkspaces.map(w => w.id);

    if (workspaceIds.length === 0) {
      return { totalWorkspaces: 0, totalTasks: 0, completedTasks: 0, pendingTasks: 0, workspaces: [] };
    }

    const [totalTasksRes] = await this.db
      .select({ value: count() })
      .from(tasks)
      .where(inArray(tasks.workspaceId, workspaceIds));

    const [completedTasksRes] = await this.db
      .select({ value: count() })
      .from(tasks)
      .where(and(
        inArray(tasks.workspaceId, workspaceIds),
        eq(tasks.status, 'DONE')
      ));

    const myWorkspaces = await this.db
      .select({
        id: workspaces.id,
        name: workspaces.name,
        createdAt: workspaces.createdAt,
      })
      .from(workspaces)
      .where(inArray(workspaces.id, workspaceIds));

    return {
      totalWorkspaces: workspaceIds.length,
      totalTasks: Number(totalTasksRes.value),
      completedTasks: Number(completedTasksRes.value),
      pendingTasks: Number(totalTasksRes.value) - Number(completedTasksRes.value),
      workspaces: myWorkspaces
    };
  }
}