import 'server-only';
import { supabaseAdmin } from '@/lib/supabase/server';
import type { Trip } from '@/lib/types';

/** V1 is single-trip. This is the one place that assumption lives. */
export async function getActiveTrip(): Promise<Trip> {
  const { data, error } = await supabaseAdmin()
    .from('trips')
    .select('*')
    .order('created_at', { ascending: true })
    .limit(1)
    .single();

  if (error || !data) {
    throw new Error(
      `No trip found — run supabase/schema.sql then supabase/seed.sql in the Supabase SQL editor. (${error?.message ?? 'no rows'})`
    );
  }

  return data as Trip;
}
