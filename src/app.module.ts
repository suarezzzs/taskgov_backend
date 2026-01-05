import { Module } from '@nestjs/common';
import { ConfigModule } from "@nestjs/config";
import { DatabaseModule } from "./database/database.module";
import { databaseConfig } from './database/database.config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TasksModule } from './tasks/tasks.module';
import { WorkspacesModule } from './workspaces/workspaces.module';
import { ChecklistsModule } from './checklists/checklists.module';
import { LogsModule } from './logs/logs.module';
import { AttachmentsModule } from './attachments/attachments.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),
    DatabaseModule,
    UsersModule,
    AuthModule,
    TasksModule,
    WorkspacesModule,
    ChecklistsModule,
    LogsModule,
    AttachmentsModule,
    DashboardModule,
  ],
})
export class AppModule {}