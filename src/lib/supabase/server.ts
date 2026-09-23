import 'server-only';
import { createClient } from '@supabase/supabase-js';

/**
 * Service-role client for server actions and route handlers only.
 * Bypasses RLS entirely — never import this from a client component.
 */
export function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      'Supabase is not configured yet — set SUPABASE_SERVICE_ROLE_KEY (and NEXT_PUBLIC_SUPABASE_URL) in .env.local.'
    );
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export const TRIP_FILES_BUCKET = 'trip-files';
