'use server';

import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/server';
import { requireUser } from '@/lib/actions/require-user';
import { revalidateTripViews } from '@/lib/actions/revalidate';
import { uuidLike } from '@/lib/validation';

const schema = z.object({
  trip_id: uuidLike,
  name: z.string().trim().min(1).max(200),
  age: z.number().int().min(0).max(130).optional().nullable(),
  phone: z.string().trim().max(40).optional().nullable(),
  connect_url: z.string().url().optional().nullable(),
  looks: z.number().int().min(1).max(10).optional().nullable(),
  wife_material: z.number().int().min(1).max(10).optional().nullable(),
  personality: z.number().int().min(1).max(10).optional().nullable(),
  notes: z.string().trim().max(2000).optional().nullable(),
});

export async function createWifeCandidate(input: z.infer<typeof schema>) {
  const userId = await requireUser();
  const parsed = schema.parse(input);

  const { error } = await supabaseAdmin()
    .from('wife_candidates')
    .insert({ ...parsed, created_by: userId });

  if (error) throw new Error(`Couldn't save candidate: ${error.message}`);
  revalidateTripViews(['/wife']);
}

const patchSchema = schema.omit({ trip_id: true }).partial();

export async function updateWifeCandidate(id: string, patch: z.infer<typeof patchSchema>) {
  await requireUser();
  const parsed = patchSchema.parse(patch);

  const { error } = await supabaseAdmin().from('wife_candidates').update(parsed).eq('id', id);
  if (error) throw new Error(`Couldn't update candidate: ${error.message}`);
  revalidateTripViews(['/wife']);
}

export async function deleteWifeCandidate(id: string) {
  await requireUser();
  const { error } = await supabaseAdmin().from('wife_candidates').delete().eq('id', id);
  if (error) throw new Error(`Couldn't delete candidate: ${error.message}`);
  revalidateTripViews(['/wife']);
}
