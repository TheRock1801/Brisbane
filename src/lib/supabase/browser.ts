'use client';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let cached: SupabaseClient | null = null;

/**
 * Anon-key client for client components — read-only via RLS (see
 * supabase/schema.sql). Used only to subscribe to realtime changes; every
 * write goes through a server action instead.
 */
export function supabaseBrowser(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;

  if (!cached) {
    cached = createClient(url, anonKey);
  }
  return cached;
}
