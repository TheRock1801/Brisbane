'use server';

import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/server';
import { requireUser } from '@/lib/actions/require-user';
import { revalidateTripViews } from '@/lib/actions/revalidate';
import { CATEGORIES, DAYS } from '@/lib/types';

const ideaSchema = z.object({
  trip_id: z.string().uuid(),
  day: z.enum(DAYS as [string, ...string[]]),
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).optional().nullable(),
  category: z.enum(CATEGORIES as [string, ...string[]]).default('other'),
  image_url: z.string().url().optional().nullable(),
  source_url: z.string().url().optional().nullable(),
  address: z.string().trim().max(300).optional().nullable(),
  suburb: z.string().trim().max(120).optional().nullable(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
});

export async function createIdea(input: z.infer<typeof ideaSchema>) {
  const userId = await requireUser();
  const parsed = ideaSchema.parse(input);

  const { data, error } = await supabaseAdmin()
    .from('ideas')
    .insert({ ...parsed, created_by: userId })
    .select('id')
    .single();

  if (error) throw new Error(`Couldn't save idea: ${error.message}`);
  revalidateTripViews();
  return data.id as string;
}

const ideaPatchSchema = ideaSchema.omit({ trip_id: true }).partial();

export async function updateIdea(ideaId: string, patch: z.infer<typeof ideaPatchSchema>) {
  await requireUser();
  const parsed = ideaPatchSchema.parse(patch);

  const { error } = await supabaseAdmin().from('ideas').update(parsed).eq('id', ideaId);
  if (error) throw new Error(`Couldn't update idea: ${error.message}`);
  revalidateTripViews([`/idea/${ideaId}`]);
}

export async function deleteIdea(ideaId: string) {
  await requireUser();
  const { error } = await supabaseAdmin().from('ideas').delete().eq('id', ideaId);
  if (error) throw new Error(`Couldn't delete idea: ${error.message}`);
  revalidateTripViews();
}
