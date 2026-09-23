import { NextResponse, type NextRequest } from 'next/server';
import { setSession } from '@/lib/auth/session';
import type { UserId } from '@/lib/types';

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const password = String(form.get('password') ?? '');
  const userId = String(form.get('userId') ?? '');
  const next = String(form.get('next') ?? '/');
  const safeNext = next.startsWith('/') ? next : '/';

  const fail = (error: string) => {
    const url = new URL('/login', request.url);
    url.searchParams.set('error', error);
    if (safeNext !== '/') url.searchParams.set('next', safeNext);
    return NextResponse.redirect(url, { status: 303 });
  };

  const expected = process.env.TRIP_PASSWORD;
  if (!expected) return fail('not_configured');
  if (userId !== 'rocky' && userId !== 'vince') return fail('pick_user');
  if (password !== expected) return fail('wrong_password');

  await setSession(userId as UserId);
  return NextResponse.redirect(new URL(safeNext, request.url), { status: 303 });
}
