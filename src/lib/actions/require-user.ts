import 'server-only';
import { getSession } from '@/lib/auth/session';
import type { UserId } from '@/lib/types';

/** Every server action calls this first — render-time gating alone isn't a security boundary. */
export async function requireUser(): Promise<UserId> {
  const session = await getSession();
  if (!session) throw new Error('Not signed in.');
  return session;
}
