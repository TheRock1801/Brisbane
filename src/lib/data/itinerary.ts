import 'server-only';
import { supabaseAdmin } from '@/lib/supabase/server';
import type { Day, Idea, ItineraryItem } from '@/lib/types';

export interface ItineraryItemWithIdea extends ItineraryItem {
  idea: Idea;
}

export async function getItineraryForTrip(tripId: string): Promise<ItineraryItemWithIdea[]> {
  const { data, error } = await supabaseAdmin()
    .from('itinerary_items')
    .select('*, idea:ideas(*)')
    .eq('trip_id', tripId)
    .order('day', { ascending: true })
    .order('position', { ascending: true });

  if (error) throw new Error(`Failed to load itinerary: ${error.message}`);
  return data as unknown as ItineraryItemWithIdea[];
}

export async function getItineraryForDay(
  tripId: string,
  day: Day
): Promise<ItineraryItemWithIdea[]> {
  const all = await getItineraryForTrip(tripId);
  return all.filter((i) => i.day === day);
}
