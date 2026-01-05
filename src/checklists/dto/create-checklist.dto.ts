import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const CreateChecklistSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long'),
  taskId: z.string().uuid('Invalid task ID'),
});

export class CreateChecklistDto extends createZodDto(CreateChecklistSchema) {}