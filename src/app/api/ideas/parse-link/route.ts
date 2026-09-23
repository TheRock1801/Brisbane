import { NextResponse, type NextRequest } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { parseLink } from '@/lib/link-parser';

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => null);
  const url = typeof body?.url === 'string' ? body.url.trim() : '';

  if (!url || !/^https?:\/\//i.test(url)) {
    return NextResponse.json({ error: 'invalid_url' }, { status: 400 });
  }

  const parsed = await parseLink(url);
  return NextResponse.json(parsed);
}
