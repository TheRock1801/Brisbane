import 'server-only';
import { supabaseAdmin } from '@/lib/supabase/server';
import { wifeTotal } from '@/lib/wife-score';
import type { WifeCandidate } from '@/lib/types';

export async function getWifeCandidates(tripId: string): Promise<WifeCandidate[]> {
  const { data, error } = await supabaseAdmin()
    .from('wife_candidates')
    .select('*')
    .eq('trip_id', tripId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to load wife candidates: ${error.message}`);

  const candidates = data as WifeCandidate[];
  return candidates.sort((a, b) => (wifeTotal(b) ?? -1) - (wifeTotal(a) ?? -1));
}
