import 'server-only';
import { supabaseAdmin } from '@/lib/supabase/server';
import type { WifeCandidate } from '@/lib/types';

export async function getWifeCandidates(tripId: string): Promise<WifeCandidate[]> {
  const { data, error } = await supabaseAdmin()
    .from('wife_candidates')
    .select('*')
    .eq('trip_id', tripId)
    .order('ranking', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to load wife candidates: ${error.message}`);
  return data as WifeCandidate[];
}
