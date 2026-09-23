import 'server-only';
import { supabaseAdmin } from '@/lib/supabase/server';
import type { BoardingPass } from '@/lib/types';

export async function getBoardingPasses(tripId: string): Promise<BoardingPass[]> {
  const { data, error } = await supabaseAdmin()
    .from('boarding_passes')
    .select('*')
    .eq('trip_id', tripId)
    .order('created_at', { ascending: true });

  if (error) throw new Error(`Failed to load boarding passes: ${error.message}`);
  return data as BoardingPass[];
}
