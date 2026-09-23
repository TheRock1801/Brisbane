'use server';

import { supabaseAdmin } from '@/lib/supabase/server';
import { requireUser } from '@/lib/actions/require-user';
import { revalidateTripViews } from '@/lib/actions/revalidate';

/**
 * A star on an idea with zero stars creates its itinerary_items row
 * (status 'maybe', unscheduled) — that's what makes it show up in Actual.
 * Removing the last star only deletes that row if nothing has actually been
 * done to it yet (still unscheduled + still 'maybe' + no notes/booking info),
 * so un-starring by accident never throws away real scheduling work.
 */
export async function toggleStar(ideaId: string) {
  const userId = await requireUser();
  const db = supabaseAdmin();

  const { data: existing, error: existingError } = await db
    .from('stars')
    .select('user_id')
    .eq('idea_id', ideaId)
    .eq('user_id', userId)
    .maybeSingle();
  if (existingError) throw new Error(`Couldn't read star: ${existingError.message}`);

  if (existing) {
    const { error } = await db.from('stars').delete().eq('idea_id', ideaId).eq('user_id', userId);
    if (error) throw new Error(`Couldn't remove star: ${error.message}`);
  } else {
    const { error } = await db.from('stars').insert({ idea_id: ideaId, user_id: userId });
    if (error) throw new Error(`Couldn't add star: ${error.message}`);
  }

  const { count } = await db
    .from('stars')
    .select('user_id', { count: 'exact', head: true })
    .eq('idea_id', ideaId);

  const { data: item } = await db
    .from('itinerary_items')
    .select('*')
    .eq('idea_id', ideaId)
    .maybeSingle();

  if ((count ?? 0) > 0 && !item) {
    const { data: idea, error: ideaError } = await db
      .from('ideas')
      .select('trip_id, day')
      .eq('id', ideaId)
      .single();
    if (ideaError || !idea) throw new Error(`Couldn't load idea: ${ideaError?.message}`);

    const { data: maxRow } = await db
      .from('itinerary_items')
      .select('position')
      .eq('trip_id', idea.trip_id)
      .eq('day', idea.day)
      .order('position', { ascending: false })
      .limit(1)
      .maybeSingle();

    const { error } = await db.from('itinerary_items').insert({
      idea_id: ideaId,
      trip_id: idea.trip_id,
      day: idea.day,
      status: 'maybe',
      position: (maxRow?.position ?? 0) + 1,
    });
    if (error) throw new Error(`Couldn't schedule idea: ${error.message}`);
  }

  if ((count ?? 0) === 0 && item) {
    const untouched =
      item.status === 'maybe' && !item.start_time && !item.booking_info && !item.notes;
    if (untouched) {
      const { error } = await db.from('itinerary_items').delete().eq('id', item.id);
      if (error) throw new Error(`Couldn't clean up itinerary item: ${error.message}`);
    }
  }

  revalidateTripViews([`/idea/${ideaId}`]);
}
