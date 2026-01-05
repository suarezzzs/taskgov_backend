import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const CreateTaskSchema = z.object({
  title: z.string().min(3, 'Title is too short'),
  description: z.string().optional(),
  workspaceId: z.string().uuid(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('LOW'),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).default('TODO'),
  startDate: z.string().transform((str) => new Date(str)).optional(),
  endDate: z.string().transform((str) => new Date(str)).optional(),
});

export class CreateTaskDto extends createZodDto(CreateTaskSchema) {}