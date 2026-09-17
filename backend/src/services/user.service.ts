import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import type { UpdateProfileInput } from '../validators/user.schema.js';

export async function getUserProfile(userId: string) {
  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      avatarUrl: users.avatarUrl,
      role: users.role,
      isTwoFactorEnabled: users.isTwoFactorEnabled,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return user;
}

export async function updateUserProfile(
  userId: string,
  data: UpdateProfileInput,
) {
  const [updatedUser] = await db
    .update(users)
    .set({
      ...(data.name !== undefined && { name: data.name }),
      ...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl }),
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      avatarUrl: users.avatarUrl,
      role: users.role,
      isTwoFactorEnabled: users.isTwoFactorEnabled,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    });

  return updatedUser;
}
