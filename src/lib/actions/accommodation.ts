'use server';

import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/server';
import { requireUser } from '@/lib/actions/require-user';
import { revalidatePath } from 'next/cache';

const schema = z.object({
  trip_id: z.string().uuid(),
  name: z.string().trim().min(1).max(200),
  address: z.string().trim().max(300).optional().nullable(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  check_in: z.string().optional().nullable(),
  check_out: z.string().optional().nullable(),
  booking_reference: z.string().trim().max(60).optional().nullable(),
  booking_url: z.string().url().optional().nullable(),
  notes: z.string().trim().max(2000).optional().nullable(),
  image_url: z.string().url().optional().nullable(),
});

function revalidate() {
  revalidatePath('/trip/accommodation');
  revalidatePath('/map');
  revalidatePath('/');
}

export async function createAccommodation(input: z.infer<typeof schema>) {
  await requireUser();
  const parsed = schema.parse(input);
  const { error } = await supabaseAdmin().from('accommodation').insert(parsed);
  if (error) throw new Error(`Couldn't save accommodation: ${error.message}`);
  revalidate();
}

export async function updateAccommodation(id: string, patch: Partial<z.infer<typeof schema>>) {
  await requireUser();
  const parsed = schema.partial().parse(patch);
  const { error } = await supabaseAdmin().from('accommodation').update(parsed).eq('id', id);
  if (error) throw new Error(`Couldn't update accommodation: ${error.message}`);
  revalidate();
}

export async function deleteAccommodation(id: string) {
  await requireUser();
  const { error } = await supabaseAdmin().from('accommodation').delete().eq('id', id);
  if (error) throw new Error(`Couldn't delete accommodation: ${error.message}`);
  revalidate();
}
