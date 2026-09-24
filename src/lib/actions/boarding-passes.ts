'use server';

import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/server';
import { requireUser } from '@/lib/actions/require-user';
import { revalidatePath } from 'next/cache';
import { uuidLike } from '@/lib/validation';

const schema = z.object({
  trip_id: uuidLike,
  flight_id: uuidLike.optional().nullable(),
  leg: z.enum(['outbound', 'return']),
  file_url: z.string().url(),
  file_type: z.enum(['image', 'pdf']),
});

export async function createBoardingPass(input: z.infer<typeof schema>) {
  const userId = await requireUser();
  const parsed = schema.parse(input);

  const { error } = await supabaseAdmin()
    .from('boarding_passes')
    .insert({ ...parsed, user_id: userId });
  if (error) throw new Error(`Couldn't save boarding pass: ${error.message}`);
  revalidatePath('/trip/boarding-passes');
}

export async function deleteBoardingPass(id: string) {
  const userId = await requireUser();
  const { error, count } = await supabaseAdmin()
    .from('boarding_passes')
    .delete({ count: 'exact' })
    .eq('id', id)
    .eq('user_id', userId);
  if (error) throw new Error(`Couldn't delete boarding pass: ${error.message}`);
  if (!count) throw new Error('You can only delete your own boarding pass.');
  revalidatePath('/trip/boarding-passes');
}
