import 'server-only';
import { supabaseAdmin } from '@/lib/supabase/server';
import type { Accommodation } from '@/lib/types';

export async function getAccommodation(tripId: string): Promise<Accommodation[]> {
  const { data, error } = await supabaseAdmin()
    .from('accommodation')
    .select('*')
    .eq('trip_id', tripId)
    .order('check_in', { ascending: true });

  if (error) throw new Error(`Failed to load accommodation: ${error.message}`);
  return data as Accommodation[];
}
