import { eq, sql } from 'drizzle-orm';
import { db } from '../db/index.js';
import { tokens, users } from '../db/schema.js';
import type { LoginInput, RegisterInput } from './auth.schema.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { sendPasswordResetEmail } from '../services/email.service.js';
import {
  createTwoFactorSetupToken,
  createTwoFactorLoginToken,
} from '../utils/jwt.js';
import {
  findValidToken,
  generatePasswordResetToken,
  issueAuthTokens,
  revokeAllUserTokens,
  storeToken,
} from './token.service.js';

export async function registerUser(input: RegisterInput) {
  const existingUser = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, input.email))
    .limit(1);

  if (existingUser.length > 0) {
    throw new Error('Email already registered');
  }

  const passwordHash = await hashPassword(input.password);

  const [user] = await db
    .insert(users)
    .values({
      name: input.name,
      email: input.email,
      passwordHash,
      role: input.role,
      avatarUrl: input.avatarUrl ?? null,
    })
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      avatarUrl: users.avatarUrl,
    });

  if (!user) {
    throw new Error('Failed to create user');
  }

  const setupToken = createTwoFactorSetupToken({
    userId: user.id,
    purpose: '2fa_setup',
  });

  return { user, setupToken };
}

export async function loginUser(input: LoginInput) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, input.email))
    .limit(1);

  if (!user) {
    throw new Error('Invalid email or password');
  }

  const passwordValid = await verifyPassword(user.passwordHash, input.password);

  if (!passwordValid) {
    throw new Error('Invalid email or password');
  }

  if (user.isTwoFactorEnabled) {
    const twoFactorLoginToken = createTwoFactorLoginToken({
      userId: user.id,
      purpose: '2fa_login',
    });

    return {
      requiresTwoFactor: true,
      twoFactorLoginToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  const authTokens = await issueAuthTokens({
    id: user.id,
    role: user.role,
    tokenVersion: user.tokenVersion,
  });

  return {
    requiresTwoFactor: false,
    accessToken: authTokens.accessToken,
    refreshToken: authTokens.refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}
async function findUserByEmail(email: string) {
  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
    })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  return user;
}

export async function forgotPassword(email: string) {
  const user = await findUserByEmail(email);

  if (!user) {
    return null;
  }

  const resetToken = await generatePasswordResetToken();

  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await storeToken(user.id, resetToken, 'password_reset', expiresAt);

  const frontendUrl = process.env.FRONTEND_URL;

  if (!frontendUrl) {
    throw new Error('FRONTEND_URL is not defined');
  }

  const resetUrl = `${frontendUrl}/reset-password?token=${encodeURIComponent(
    resetToken,
  )}`;

  await sendPasswordResetEmail(user.email, resetUrl);

  return {
    expiresAt,
  };
}

export async function resetPassword(token: string, newPassword: string) {
  const storedToken = await findValidToken(token, 'password_reset');

  if (!storedToken) {
    return false;
  }

  const passwordHash = await hashPassword(newPassword);

  await db
    .update(users)
    .set({
      passwordHash,
    })
    .where(eq(users.id, storedToken.userId));

  await db
    .update(tokens)
    .set({
      usedAt: new Date(),
    })
    .where(eq(tokens.id, storedToken.id));

  await revokeAllUserTokens(storedToken.userId);

  await db
    .update(users)
    .set({
      tokenVersion: sql`${users.tokenVersion} + 1`,
    })
    .where(eq(users.id, storedToken.userId));

  return true;
}
