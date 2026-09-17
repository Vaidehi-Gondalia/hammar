import type { Request, Response } from 'express';
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from './auth.schema.js';
import { eq, sql } from 'drizzle-orm';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { uploadAvatar } from '../services/cloudinary.service.js';

import {
  forgotPassword,
  loginUser,
  registerUser,
  resetPassword,
} from './auth.service.js';

import {
  findValidToken,
  issueAuthTokens,
  revokeAllUserTokens,
  revokeToken,
} from './token.service.js';
import { AuthenticatedRequest } from './auth.middleware.js';
import {
  setupTwoFactor,
  verifyAndEnableTwoFactor,
  verifyTwoFactorForLogin,
} from './twoFactor.service.js';

export async function register(req: Request, res: Response) {
  const avatarFile = req.file;

  if (avatarFile && !avatarFile.mimetype.startsWith('image/')) {
    return res.status(400).json({
      message: 'Only image files are allowed for avatar',
    });
  }

  const result = registerSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: result.error.flatten().fieldErrors,
    });
  }

  try {
    let avatarUrl: string | null = null;

    if (avatarFile) {
      const uploadResult = await uploadAvatar(avatarFile);
      avatarUrl = uploadResult.secure_url;
    }

    const { user, setupToken } = await registerUser({
      ...result.data,
      avatarUrl,
    });

    res.cookie('two_factor_setup_token', setupToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 10 * 60 * 1000,
    });

    return res.status(201).json({
      message: 'Registration successful. 2FA setup required.',
      user,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === 'Email already registered'
    ) {
      return res.status(409).json({
        message: error.message,
      });
    }

    console.error(error);

    return res.status(500).json({
      message: 'Internal server error',
    });
  }
}

export async function login(req: Request, res: Response) {
  const result = loginSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: result.error.flatten().fieldErrors,
    });
  }

  try {
    const loginResult = await loginUser(result.data);

    if (loginResult.requiresTwoFactor) {
      res.cookie('two_factor_login_token', loginResult.twoFactorLoginToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 10 * 60 * 1000,
      });

      return res.status(200).json({
        message: 'Two-factor authentication required',
        requiresTwoFactor: true,
        user: loginResult.user,
      });
    }

    res.cookie('access_token', loginResult.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.cookie('refresh_token', loginResult.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: 'Login successful',
      requiresTwoFactor: false,
      user: loginResult.user,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === 'Invalid email or password'
    ) {
      return res.status(401).json({
        message: error.message,
      });
    }

    console.error(error);

    return res.status(500).json({
      message: 'Internal server error',
    });
  }
}

export async function refresh(req: Request, res: Response) {
  const refreshToken = req.cookies?.refresh_token;

  if (!refreshToken) {
    return res.status(401).json({
      message: 'Refresh token required',
    });
  }

  try {
    const storedToken = await findValidToken(refreshToken, 'refresh');

    if (!storedToken) {
      return res.status(401).json({
        message: 'Invalid or expired refresh token',
      });
    }

    const [user] = await db
      .select({
        id: users.id,
        role: users.role,
        tokenVersion: users.tokenVersion,
      })
      .from(users)
      .where(eq(users.id, storedToken.userId))
      .limit(1);

    if (!user) {
      return res.status(401).json({
        message: 'User not found',
      });
    }

    await revokeToken(refreshToken);

    const authTokens = await issueAuthTokens({
      id: user.id,
      role: user.role,
      tokenVersion: user.tokenVersion,
    });

    res.cookie('access_token', authTokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.cookie('refresh_token', authTokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: 'Token refreshed successfully',
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: 'Internal server error',
    });
  }
}

export async function logout(req: Request, res: Response) {
  const refreshToken = req.cookies?.refresh_token;

  if (refreshToken) {
    await revokeToken(refreshToken);
  }
  res.clearCookie('access_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });

  res.clearCookie('refresh_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });

  return res.status(200).json({
    message: 'Logout successful',
  });
}

export async function getCurrentUser(
  req: Request & {
    user?: {
      userId: string;
      role: 'buyer' | 'seller';
    };
  },
  res: Response,
) {
  if (!req.user) {
    return res.status(401).json({
      message: 'Authentication required',
    });
  }

  try {
    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
      })
      .from(users)
      .where(eq(users.id, req.user.userId))
      .limit(1);

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    return res.status(200).json({
      user,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: 'Internal server error',
    });
  }
}

export async function logoutAllDevices(
  req: Request & {
    user?: {
      userId: string;
      role: 'buyer' | 'seller';
    };
  },
  res: Response,
) {
  if (!req.user) {
    return res.status(401).json({
      message: 'Authentication required',
    });
  }

  try {
    await db
      .update(users)
      .set({
        tokenVersion: sql`${users.tokenVersion} + 1`,
      })
      .where(eq(users.id, req.user.userId));

    await revokeAllUserTokens(req.user.userId);

    res.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return res.status(200).json({
      message: 'Logged out from all devices',
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: 'Internal server error',
    });
  }
}

export async function setupTwoFactorAuth(
  req: AuthenticatedRequest,
  res: Response,
) {
  if (!req.user) {
    return res.status(401).json({
      message: 'Authentication required',
    });
  }

  try {
    const result = await setupTwoFactor(req.user.userId);

    return res.status(200).json({
      message: 'Two-factor authentication setup initiated',
      otpUri: result.otpUri,
      qrCodeDataUrl: result.qrCodeDataUrl,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to setup two-factor authentication';

    return res.status(400).json({
      message,
    });
  }
}
export async function verifyTwoFactorAuth(
  req: AuthenticatedRequest,
  res: Response,
) {
  if (!req.user) {
    return res.status(401).json({
      message: 'Authentication required',
    });
  }

  const { code } = req.body;

  if (typeof code !== 'string' || !/^\d{6}$/.test(code)) {
    return res.status(400).json({
      message: 'A valid 6-digit authentication code is required',
    });
  }

  try {
    const result = await verifyAndEnableTwoFactor(req.user.userId, code);

    const authTokens = await issueAuthTokens({
      id: result.user.id,
      role: result.user.role,
      tokenVersion: result.user.tokenVersion,
    });

    res.cookie('access_token', authTokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.cookie('refresh_token', authTokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.clearCookie('two_factor_setup_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return res.status(200).json({
      message: 'Two-factor authentication enabled successfully',
      user: result.user,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to verify two-factor authentication';

    return res.status(400).json({
      message,
    });
  }
}

export async function verifyTwoFactorLogin(req: Request, res: Response) {
  const token = req.cookies?.two_factor_login_token;

  if (!token) {
    return res.status(401).json({
      message: 'Two-factor login authentication required',
    });
  }

  const { code } = req.body;

  if (typeof code !== 'string' || !/^\d{6}$/.test(code)) {
    return res.status(400).json({
      message: 'A valid 6-digit authentication code is required',
    });
  }

  try {
    const { verifyTwoFactorLoginToken } = await import('../utils/jwt.js');

    const payload = verifyTwoFactorLoginToken(token);

    if (payload.purpose !== '2fa_login') {
      return res.status(401).json({
        message: 'Invalid two-factor login token',
      });
    }

    const user = await verifyTwoFactorForLogin(payload.userId, code);
    const authTokens = await issueAuthTokens({
      id: user.id,
      role: user.role,
      tokenVersion: user.tokenVersion,
    });

    res.cookie('access_token', authTokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.cookie('refresh_token', authTokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.clearCookie('two_factor_login_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return res.status(200).json({
      message: 'Two-factor authentication successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Two-factor authentication failed';

    return res.status(401).json({
      message,
    });
  }
}

export async function forgotPasswordController(req: Request, res: Response) {
  const result = forgotPasswordSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: 'Invalid email',
      errors: result.error.flatten().fieldErrors,
    });
  }

  try {
    const resultData = await forgotPassword(result.data.email);

    // Do not reveal whether an account exists.
    if (!resultData) {
      return res.status(200).json({
        message:
          'If an account exists with this email, a password reset link has been sent.',
      });
    }

    return res.status(200).json({
      message: 'If an account exists, a password reset link has been sent.',
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: 'Internal server error',
    });
  }
}

export async function resetPasswordController(req: Request, res: Response) {
  const result = resetPasswordSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: 'Invalid reset password data',
      errors: result.error.flatten().fieldErrors,
    });
  }

  try {
    const success = await resetPassword(
      result.data.token,
      result.data.newPassword,
    );

    if (!success) {
      return res.status(400).json({
        message: 'Invalid or expired reset token',
      });
    }

    return res.status(200).json({
      message: 'Password reset successfully',
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: 'Internal server error',
    });
  }
}
