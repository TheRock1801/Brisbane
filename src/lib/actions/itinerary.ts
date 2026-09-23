'use server';

import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/server';
import { requireUser } from '@/lib/actions/require-user';
import { revalidateTripViews } from '@/lib/actions/revalidate';
import { DAYS } from '@/lib/types';

const patchSchema = z.object({
  day: z.enum(DAYS as [string, ...string[]]).optional(),
  start_time: z.string().nullable().optional(),
  end_time: z.string().nullable().optional(),
  status: z.enum(['maybe', 'locked_in', 'booked']).optional(),
  notes: z.string().max(2000).nullable().optional(),
  booking_info: z.string().max(2000).nullable().optional(),
});

export async function updateItineraryItem(itemId: string, patch: z.infer<typeof patchSchema>) {
  await requireUser();
  const parsed = patchSchema.parse(patch);

  const { error } = await supabaseAdmin()
    .from('itinerary_items')
    .update({ ...parsed, updated_at: new Date().toISOString() })
    .eq('id', itemId);

  if (error) throw new Error(`Couldn't update itinerary item: ${error.message}`);
  revalidateTripViews();
}

/** Persists a new top-to-bottom order (and optionally a new day) after a drag/move-up-down action. */
export async function reorderDay(day: string, orderedItemIds: string[]) {
  await requireUser();
  const db = supabaseAdmin();

  await Promise.all(
    orderedItemIds.map((id, index) =>
      db.from('itinerary_items').update({ day, position: index }).eq('id', id)
    )
  );

  revalidateTripViews();
}
