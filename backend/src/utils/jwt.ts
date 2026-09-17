import jwt from 'jsonwebtoken';

const JWT_SECRET: string = process.env.JWT_SECRET ?? '';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined');
}

export type AuthTokenPayload = {
  userId: string;
  role: 'buyer' | 'seller';
  tokenVersion: number;
};

export type TwoFactorSetupTokenPayload = {
  userId: string;
  purpose: '2fa_setup';
};

export type TwoFactorLoginTokenPayload = {
  userId: string;
  purpose: '2fa_login';
};

export function createAccessToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '1d',
  });
}

export function verifyAccessToken(token: string): AuthTokenPayload {
  return jwt.verify(token, JWT_SECRET) as unknown as AuthTokenPayload;
}

export function createTwoFactorSetupToken(
  payload: TwoFactorSetupTokenPayload,
): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '10m',
  });
}

export function verifyTwoFactorSetupToken(
  token: string,
): TwoFactorSetupTokenPayload {
  return jwt.verify(token, JWT_SECRET) as unknown as TwoFactorSetupTokenPayload;
}

export function createTwoFactorLoginToken(
  payload: TwoFactorLoginTokenPayload,
): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '10m' });
}

export function verifyTwoFactorLoginToken(
  token: string,
): TwoFactorLoginTokenPayload {
  return jwt.verify(token, JWT_SECRET) as unknown as TwoFactorLoginTokenPayload;
}
