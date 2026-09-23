import 'server-only';
import { supabaseAdmin } from '@/lib/supabase/server';
import type { Flight } from '@/lib/types';

export async function getFlights(tripId: string): Promise<Flight[]> {
  const { data, error } = await supabaseAdmin()
    .from('flights')
    .select('*')
    .eq('trip_id', tripId)
    .order('departure_time', { ascending: true });

  if (error) throw new Error(`Failed to load flights: ${error.message}`);
  return data as Flight[];
}
