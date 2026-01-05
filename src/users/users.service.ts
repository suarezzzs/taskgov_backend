import { Inject, Injectable } from '@nestjs/common';
import { DRIZZLE } from '../database/database.module';
import { users } from '../database/schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../database/schema';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcrypt'; 

@Injectable()
export class UsersService {
  constructor(
    @Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async findByEmail(email: string) {
    const [user] = await this.db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async findById(id: string) {
    const [user] = await this.db.select().from(users).where(eq(users.id, id));
    if (user) {
        const { password, ...result } = user;
        return result;
    }
    return null;
  }

  async create(createUserDto: any) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const [newUser] = await this.db.insert(users).values({
        name: createUserDto.name,
        email: createUserDto.email,
        password: hashedPassword,
        role: 'USER',
      }).returning();
    const { password, ...result } = newUser;
    return result;
  }

  async update(userId: string, data: { name?: string; password?: string }) {
    const updateData: any = {};

    if (data.name) {
        updateData.name = data.name;
    }

    if (data.password && data.password.trim() !== '') {
        updateData.password = await bcrypt.hash(data.password, 10);
    }

    const [updatedUser] = await this.db
        .update(users)
        .set(updateData)
        .where(eq(users.id, userId))
        .returning();

    const { password, ...result } = updatedUser;
    return result;
  }
}