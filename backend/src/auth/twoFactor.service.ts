import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import {
  generateTwoFactorOtpUri,
  generateTwoFactorSecret,
} from '../utils/twoFactor.js';
import { verifyTwoFactorCode } from '../utils/twoFactor.js';
import QRCode from 'qrcode';

export async function setupTwoFactor(userId: string) {
  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      isTwoFactorEnabled: users.isTwoFactorEnabled,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    throw new Error('User not found');
  }

  if (user.isTwoFactorEnabled) {
    throw new Error('Two-factor authentication is already enabled');
  }

  const secret = generateTwoFactorSecret();

  const otpUri = generateTwoFactorOtpUri(user.email, secret);

  const qrCodeDataUrl = await QRCode.toDataURL(otpUri);

  await db
    .update(users)
    .set({
      twoFactorSecret: secret,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  return {
    otpUri,
    qrCodeDataUrl,
  };
}

export async function verifyAndEnableTwoFactor(userId: string, code: string) {
  const [user] = await db
    .select({
      id: users.id,
      twoFactorSecret: users.twoFactorSecret,
      isTwoFactorEnabled: users.isTwoFactorEnabled,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    throw new Error('User not found');
  }

  if (user.isTwoFactorEnabled) {
    throw new Error('Two-factor authentication is already enabled');
  }

  if (!user.twoFactorSecret) {
    throw new Error('Two-factor authentication setup has not been initiated');
  }

  const isValid = await verifyTwoFactorCode(user.twoFactorSecret, code);

  if (!isValid) {
    throw new Error('Invalid two-factor authentication code');
  }

  await db
    .update(users)
    .set({
      isTwoFactorEnabled: true,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  const [updatedUser] = await db
    .select({
      id: users.id,
      role: users.role,
      tokenVersion: users.tokenVersion,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!updatedUser) {
    throw new Error('User not found');
  }

  return {
    enabled: true,
    user: updatedUser,
  };
}

export async function verifyTwoFactorForLogin(userId: string, code: string) {
  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      tokenVersion: users.tokenVersion,
      twoFactorSecret: users.twoFactorSecret,
      isTwoFactorEnabled: users.isTwoFactorEnabled,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    throw new Error('User not found');
  }

  if (!user.isTwoFactorEnabled) {
    throw new Error('Two-factor authentication is not enabled');
  }

  if (!user.twoFactorSecret) {
    throw new Error('Two-factor authentication is not configured');
  }

  const isValid = await verifyTwoFactorCode(user.twoFactorSecret, code);

  if (!isValid) {
    throw new Error('Invalid two-factor authentication code');
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    tokenVersion: user.tokenVersion,
  };
}
