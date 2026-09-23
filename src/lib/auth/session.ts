import 'server-only';
import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';
import type { UserId } from '@/lib/types';
import { SESSION_COOKIE } from '@/lib/auth/constants';

export { SESSION_COOKIE };
const MAX_AGE_SECONDS = 60 * 60 * 24 * 180; // 180 days — this is a low-stakes shared trip app

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error('SESSION_SECRET is not set in .env.local');
  return s;
}

function sign(userId: UserId): string {
  const sig = createHmac('sha256', secret()).update(userId).digest('hex');
  return `${userId}.${sig}`;
}

function verify(token: string): UserId | null {
  const [userId, sig] = token.split('.');
  if (!userId || !sig) return null;
  if (userId !== 'rocky' && userId !== 'vince') return null;

  const expected = createHmac('sha256', secret()).update(userId).digest('hex');
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  return userId;
}

export async function getSession(): Promise<UserId | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verify(token);
}

export async function setSession(userId: UserId) {
  const store = await cookies();
  store.set(SESSION_COOKIE, sign(userId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function clearSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
