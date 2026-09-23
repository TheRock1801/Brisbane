import { NextResponse, type NextRequest } from 'next/server';
import { setSession } from '@/lib/auth/session';
import type { UserId } from '@/lib/types';

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const userId = String(form.get('userId') ?? '');
  const next = String(form.get('next') ?? '/');
  const safeNext = next.startsWith('/') ? next : '/';

  if (userId !== 'rocky' && userId !== 'vince') {
    const url = new URL('/login', request.url);
    url.searchParams.set('error', 'pick_user');
    if (safeNext !== '/') url.searchParams.set('next', safeNext);
    return NextResponse.redirect(url, { status: 303 });
  }

  await setSession(userId as UserId);
  return NextResponse.redirect(new URL(safeNext, request.url), { status: 303 });
}
