import 'server-only';
import { supabaseAdmin } from '@/lib/supabase/server';
import type { Expense } from '@/lib/types';

export async function getExpenses(tripId: string): Promise<Expense[]> {
  const { data, error } = await supabaseAdmin()
    .from('expenses')
    .select('*')
    .eq('trip_id', tripId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to load expenses: ${error.message}`);
  return data as Expense[];
}
