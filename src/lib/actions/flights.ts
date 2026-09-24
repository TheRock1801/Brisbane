'use server';

import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/server';
import { requireUser } from '@/lib/actions/require-user';
import { revalidatePath } from 'next/cache';
import { uuidLike } from '@/lib/validation';

const flightSchema = z.object({
  trip_id: uuidLike,
  airline: z.string().trim().min(1).max(120),
  flight_number: z.string().trim().min(1).max(20),
  departure_airport: z.string().trim().min(3).max(10),
  arrival_airport: z.string().trim().min(3).max(10),
  departure_time: z.string().min(1),
  arrival_time: z.string().min(1),
  booking_reference: z.string().trim().max(60).optional().nullable(),
  notes: z.string().trim().max(2000).optional().nullable(),
});

export async function createFlight(input: z.infer<typeof flightSchema>) {
  await requireUser();
  const parsed = flightSchema.parse(input);
  const { error } = await supabaseAdmin().from('flights').insert(parsed);
  if (error) throw new Error(`Couldn't save flight: ${error.message}`);
  revalidatePath('/trip/flights');
  revalidatePath('/');
}

export async function updateFlight(id: string, patch: Partial<z.infer<typeof flightSchema>>) {
  await requireUser();
  const parsed = flightSchema.partial().parse(patch);
  const { error } = await supabaseAdmin().from('flights').update(parsed).eq('id', id);
  if (error) throw new Error(`Couldn't update flight: ${error.message}`);
  revalidatePath('/trip/flights');
  revalidatePath('/');
}

export async function deleteFlight(id: string) {
  await requireUser();
  const { error } = await supabaseAdmin().from('flights').delete().eq('id', id);
  if (error) throw new Error(`Couldn't delete flight: ${error.message}`);
  revalidatePath('/trip/flights');
  revalidatePath('/');
}
