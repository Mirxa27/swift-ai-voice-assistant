import { totp } from 'otplib';

export function verifyAdmin(req: Request | { headers: Headers }): boolean {
  const secret = process.env.ADMIN_SECRET;
  const otpSecret = process.env.ADMIN_OTP_SECRET;
  const header = (req as any).headers?.get?.('authorization') ?? (req as any).headers?.authorization;
  if (!secret || !otpSecret || !header) return false;
  const [prefix, token] = header.split(' ');
  if (prefix !== 'Bearer' || !token) return false;
  const [pass, code] = token.split(':');
  if (pass !== secret) return false;
  return totp.check(code, otpSecret);
}
