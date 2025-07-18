import { describe, it, expect } from 'vitest';
import { verifyAdmin } from '../lib/auth';

describe('verifyAdmin', () => {
  const env = { ADMIN_SECRET: 'secret', ADMIN_OTP_SECRET: 'abcde' };

  it('returns true for valid token', () => {
    process.env.ADMIN_SECRET = env.ADMIN_SECRET;
    process.env.ADMIN_OTP_SECRET = env.ADMIN_OTP_SECRET;
    const code = require('otplib').totp.generate(env.ADMIN_OTP_SECRET);
    const req = { headers: new Headers({ authorization: `Bearer secret:${code}` }) } as any;
    expect(verifyAdmin(req)).toBe(true);
  });

  it('returns false for invalid token', () => {
    process.env.ADMIN_SECRET = env.ADMIN_SECRET;
    process.env.ADMIN_OTP_SECRET = env.ADMIN_OTP_SECRET;
    const req = { headers: new Headers({ authorization: 'Bearer wrong:000000' }) } as any;
    expect(verifyAdmin(req)).toBe(false);
  });
});
