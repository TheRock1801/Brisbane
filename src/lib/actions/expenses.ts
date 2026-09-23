'use server';

import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/server';
import { requireUser } from '@/lib/actions/require-user';
import { revalidatePath } from 'next/cache';
import { EXPENSE_CATEGORIES, SPLIT_TYPES, EXPENSE_STATUSES } from '@/lib/types';

const schema = z.object({
  trip_id: z.string().uuid(),
  name: z.string().trim().min(1).max(200),
  category: z.enum(EXPENSE_CATEGORIES as [string, ...string[]]).default('other'),
  amount: z.number().positive().max(1_000_000),
  paid_by: z.enum(['rocky', 'vince']),
  split_type: z.enum(SPLIT_TYPES as [string, ...string[]]).default('equal'),
  status: z.enum(EXPENSE_STATUSES as [string, ...string[]]).default('actual'),
  note: z.string().trim().max(2000).optional().nullable(),
});

function revalidate() {
  revalidatePath('/trip/budget');
  revalidatePath('/');
}

export async function createExpense(input: z.infer<typeof schema>) {
  await requireUser();
  const parsed = schema.parse(input);
  const { error } = await supabaseAdmin().from('expenses').insert(parsed);
  if (error) throw new Error(`Couldn't save expense: ${error.message}`);
  revalidate();
}

export async function updateExpense(id: string, patch: Partial<z.infer<typeof schema>>) {
  await requireUser();
  const parsed = schema.partial().parse(patch);
  const { error } = await supabaseAdmin().from('expenses').update(parsed).eq('id', id);
  if (error) throw new Error(`Couldn't update expense: ${error.message}`);
  revalidate();
}

export async function deleteExpense(id: string) {
  await requireUser();
  const { error } = await supabaseAdmin().from('expenses').delete().eq('id', id);
  if (error) throw new Error(`Couldn't delete expense: ${error.message}`);
  revalidate();
}
