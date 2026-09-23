import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE } from '@/lib/auth/constants';

// Presence-only check (Edge runtime can't use Node's crypto for the HMAC
// verify) — just enough to bounce an obviously-logged-out visitor straight
// to /login. The (app) layout does the real signature check server-side.
export function proxy(request: NextRequest) {
  const hasSession = request.cookies.has(SESSION_COOKIE);

  if (!hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!login|api/auth/login|_next/static|_next/image|favicon.ico|icons|manifest.json).*)',
  ],
};
