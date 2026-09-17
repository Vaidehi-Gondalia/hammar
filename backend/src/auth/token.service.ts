import { createHash, randomBytes } from 'node:crypto';
import { and, eq, isNull, gt } from 'drizzle-orm';
import { db } from '../db/index.js';
import { tokens } from '../db/schema.js';
import { createAccessToken } from '../utils/jwt.js';

export type TokenType = 'access' | 'refresh' | 'password_reset';

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function generateRefreshToken(): string {
  return randomBytes(64).toString('hex');
}

export function generatePasswordResetToken(): string {
  return randomBytes(32).toString('hex');
}

export async function storeToken(
  userId: string,
  token: string,
  type: TokenType,
  expiresAt: Date,
) {
  const tokenHash = hashToken(token);

  const [storedToken] = await db
    .insert(tokens)
    .values({
      userId,
      tokenHash,
      type,
      expiresAt,
    })
    .returning({
      id: tokens.id,
      userId: tokens.userId,
      type: tokens.type,
      expiresAt: tokens.expiresAt,
      createdAt: tokens.createdAt,
    });

  if (!storedToken) {
    throw new Error('Failed to store token');
  }

  return storedToken;
}

export async function findValidToken(token: string, type: TokenType) {
  const tokenHash = hashToken(token);

  const [storedToken] = await db
    .select()
    .from(tokens)
    .where(
      and(
        eq(tokens.tokenHash, tokenHash),
        eq(tokens.type, type),
        isNull(tokens.revokedAt),
        isNull(tokens.usedAt),
        gt(tokens.expiresAt, new Date()),
      ),
    )
    .limit(1);

  return storedToken;
}

export async function revokeToken(token: string) {
  const tokenHash = hashToken(token);

  await db
    .update(tokens)
    .set({
      revokedAt: new Date(),
    })
    .where(and(eq(tokens.tokenHash, tokenHash), isNull(tokens.revokedAt)));
}

export async function revokeAllUserTokens(userId: string, type?: TokenType) {
  const conditions = [eq(tokens.userId, userId), isNull(tokens.revokedAt)];

  if (type) {
    conditions.push(eq(tokens.type, type));
  }

  await db
    .update(tokens)
    .set({
      revokedAt: new Date(),
    })
    .where(and(...conditions));
}

export async function issueAuthTokens(user: {
  id: string;
  role: 'buyer' | 'seller';
  tokenVersion: number;
}) {
  const accessToken = createAccessToken({
    userId: user.id,
    role: user.role,
    tokenVersion: user.tokenVersion,
  });

  const refreshToken = generateRefreshToken();

  const accessExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await storeToken(user.id, accessToken, 'access', accessExpiresAt);

  await storeToken(user.id, refreshToken, 'refresh', refreshExpiresAt);

  return {
    accessToken,
    refreshToken,
    accessExpiresAt,
    refreshExpiresAt,
  };
}
