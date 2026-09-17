import type { NextFunction, Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { verifyAccessToken, verifyTwoFactorSetupToken } from '../utils/jwt.js';

export type AuthenticatedRequest = Request & {
  user?: {
    userId: string;
    role: 'buyer' | 'seller';
  };
};

export async function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  const token = req.cookies?.access_token;

  if (!token) {
    return res.status(401).json({
      message: 'Authentication required',
    });
  }

  try {
    const payload = verifyAccessToken(token);

    const [user] = await db
      .select({
        id: users.id,
        role: users.role,
        tokenVersion: users.tokenVersion,
      })
      .from(users)
      .where(eq(users.id, payload.userId))
      .limit(1);

    if (!user) {
      return res.status(401).json({
        message: 'User not found',
      });
    }

    if (payload.tokenVersion !== user.tokenVersion) {
      return res.status(401).json({
        message: 'Authentication token has been revoked',
      });
    }

    req.user = {
      userId: user.id,
      role: user.role,
    };

    return next();
  } catch {
    return res.status(401).json({
      message: 'Invalid or expired authentication token',
    });
  }
}

export async function authenticateTwoFactorSetup(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  const token = req.cookies?.two_factor_setup_token;

  if (!token) {
    return res.status(401).json({
      message: 'Two-factor setup authentication required',
    });
  }

  try {
    const payload = verifyTwoFactorSetupToken(token);

    if (payload.purpose !== '2fa_setup') {
      return res.status(401).json({
        message: 'Invalid two-factor setup token',
      });
    }

    const [user] = await db
      .select({
        id: users.id,
        role: users.role,
      })
      .from(users)
      .where(eq(users.id, payload.userId))
      .limit(1);

    if (!user) {
      return res.status(401).json({
        message: 'User not found',
      });
    }

    req.user = {
      userId: user.id,
      role: user.role,
    };

    return next();
  } catch {
    return res.status(401).json({
      message: 'Invalid or expired two-factor setup token',
    });
  }
}
