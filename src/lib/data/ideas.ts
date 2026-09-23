import 'server-only';
import { supabaseAdmin } from '@/lib/supabase/server';
import type { Day, Idea, IdeaWithState, ItineraryItem, UserId } from '@/lib/types';

const SELECT_WITH_STATE = '*, stars(user_id), comments(count), itinerary_items(*)';

type RawIdeaRow = Idea & {
  stars: { user_id: UserId }[];
  comments: { count: number }[];
  // itinerary_items.idea_id is unique, so PostgREST embeds this as a to-one
  // relationship (a single object or null), not an array.
  itinerary_items: ItineraryItem | null;
};

function toIdeaWithState(row: RawIdeaRow): IdeaWithState {
  const { stars, comments, itinerary_items, ...idea } = row;
  return {
    ...idea,
    stars: stars.map((s) => s.user_id),
    comment_count: comments[0]?.count ?? 0,
    itinerary: itinerary_items,
  };
}

export async function getIdeasForTrip(tripId: string, day?: Day): Promise<IdeaWithState[]> {
  let query = supabaseAdmin()
    .from('ideas')
    .select(SELECT_WITH_STATE)
    .eq('trip_id', tripId)
    .order('created_at', { ascending: false });

  if (day) query = query.eq('day', day);

  const { data, error } = await query;
  if (error) throw new Error(`Failed to load ideas: ${error.message}`);
  return (data as unknown as RawIdeaRow[]).map(toIdeaWithState);
}

export async function getIdea(ideaId: string): Promise<IdeaWithState | null> {
  const { data, error } = await supabaseAdmin()
    .from('ideas')
    .select(SELECT_WITH_STATE)
    .eq('id', ideaId)
    .maybeSingle();

  if (error) throw new Error(`Failed to load idea: ${error.message}`);
  if (!data) return null;
  return toIdeaWithState(data as unknown as RawIdeaRow);
}

export async function getStarredIdeasForTrip(tripId: string): Promise<IdeaWithState[]> {
  const all = await getIdeasForTrip(tripId);
  return all.filter((i) => i.stars.length > 0);
}
