'use server';

import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/server';
import { requireUser } from '@/lib/actions/require-user';
import { revalidateTripViews } from '@/lib/actions/revalidate';

export async function addComment(ideaId: string, content: string) {
  const userId = await requireUser();
  const trimmed = z.string().trim().min(1).max(2000).parse(content);

  const { error } = await supabaseAdmin()
    .from('comments')
    .insert({ idea_id: ideaId, user_id: userId, content: trimmed });
  if (error) throw new Error(`Couldn't post comment: ${error.message}`);

  revalidateTripViews([`/idea/${ideaId}`]);
}

export async function updateComment(commentId: string, ideaId: string, content: string) {
  const userId = await requireUser();
  const trimmed = z.string().trim().min(1).max(2000).parse(content);

  const { error, count } = await supabaseAdmin()
    .from('comments')
    .update({ content: trimmed, updated_at: new Date().toISOString() }, { count: 'exact' })
    .eq('id', commentId)
    .eq('user_id', userId);

  if (error) throw new Error(`Couldn't update comment: ${error.message}`);
  if (!count) throw new Error('You can only edit your own comments.');

  revalidateTripViews([`/idea/${ideaId}`]);
}

export async function deleteComment(commentId: string, ideaId: string) {
  const userId = await requireUser();

  const { error, count } = await supabaseAdmin()
    .from('comments')
    .delete({ count: 'exact' })
    .eq('id', commentId)
    .eq('user_id', userId);

  if (error) throw new Error(`Couldn't delete comment: ${error.message}`);
  if (!count) throw new Error('You can only delete your own comments.');

  revalidateTripViews([`/idea/${ideaId}`]);
}
