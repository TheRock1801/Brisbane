import 'server-only';
import { supabaseAdmin } from '@/lib/supabase/server';
import type { Comment } from '@/lib/types';

export async function getComments(ideaId: string): Promise<Comment[]> {
  const { data, error } = await supabaseAdmin()
    .from('comments')
    .select('*')
    .eq('idea_id', ideaId)
    .order('created_at', { ascending: true });

  if (error) throw new Error(`Failed to load comments: ${error.message}`);
  return data as Comment[];
}
