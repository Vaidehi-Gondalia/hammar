import { generateSecret, generateURI, verify } from 'otplib';

export function generateTwoFactorSecret(): string {
  return generateSecret();
}

export function generateTwoFactorOtpUri(email: string, secret: string): string {
  return generateURI({
    issuer: 'HAMMR',
    label: email,
    secret,
  });
}

export async function verifyTwoFactorCode(
  secret: string,
  code: string,
): Promise<boolean> {
  const result = await verify({
    secret,
    token: code,
  });

  return result.valid;
}
