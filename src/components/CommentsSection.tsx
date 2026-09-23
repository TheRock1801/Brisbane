'use client';

import { useState, useTransition } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Pencil, Trash2 } from 'lucide-react';
import { Avatar } from '@/components/Avatar';
import { PROFILES } from '@/lib/profiles';
import { addComment, deleteComment, updateComment } from '@/lib/actions/comments';
import { useCurrentUser } from '@/components/CurrentUserContext';
import type { Comment } from '@/lib/types';
import { formInput, formButtonPrimary } from '@/lib/form-styles';

export function CommentsSection({ ideaId, comments }: { ideaId: string; comments: Comment[] }) {
  const me = useCurrentUser();
  const [draft, setDraft] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState('');
  const [isPending, startTransition] = useTransition();

  function submitNew(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    const content = draft.trim();
    setDraft('');
    startTransition(async () => {
      await addComment(ideaId, content);
    });
  }

  function submitEdit(commentId: string) {
    if (!editDraft.trim()) return;
    startTransition(async () => {
      await updateComment(commentId, ideaId, editDraft.trim());
      setEditingId(null);
    });
  }

  function remove(commentId: string) {
    startTransition(async () => {
      await deleteComment(commentId, ideaId);
    });
  }

  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-muted">
        Comments {comments.length > 0 && `(${comments.length})`}
      </h3>

      <div className="space-y-4">
        {comments.map((c) => (
          <div key={c.id} className="flex gap-2.5">
            <Avatar userId={c.user_id} size={30} />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-semibold">{PROFILES[c.user_id].display_name}</span>
                <span className="text-xs text-muted">
                  {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                </span>
              </div>

              {editingId === c.id ? (
                <div className="mt-1">
                  <textarea
                    value={editDraft}
                    onChange={(e) => setEditDraft(e.target.value)}
                    rows={2}
                    className={`${formInput} text-sm`}
                    autoFocus
                  />
                  <div className="mt-1.5 flex gap-3 text-xs font-medium">
                    <button onClick={() => submitEdit(c.id)} className="text-accent">
                      Save
                    </button>
                    <button onClick={() => setEditingId(null)} className="text-muted">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="mt-0.5 whitespace-pre-wrap text-[15px] leading-snug">{c.content}</p>
              )}

              {c.user_id === me && editingId !== c.id && (
                <div className="mt-1 flex gap-3">
                  <button
                    onClick={() => {
                      setEditingId(c.id);
                      setEditDraft(c.content);
                    }}
                    className="flex items-center gap-1 text-xs text-muted"
                  >
                    <Pencil size={12} /> Edit
                  </button>
                  <button
                    onClick={() => remove(c.id)}
                    className="flex items-center gap-1 text-xs text-muted"
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {comments.length === 0 && <p className="text-sm text-muted">No comments yet.</p>}
      </div>

      <form onSubmit={submitNew} className="mt-4 flex items-end gap-2">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add a comment…"
          rows={1}
          className={`${formInput} resize-none`}
        />
        <button
          type="submit"
          disabled={isPending || !draft.trim()}
          className={`${formButtonPrimary} w-auto px-5 py-3`}
        >
          Post
        </button>
      </form>
    </div>
  );
}
