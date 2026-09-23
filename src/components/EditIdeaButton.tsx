'use client';

import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { AddIdeaSheet } from '@/components/AddIdeaSheet';
import type { IdeaWithState } from '@/lib/types';

export function EditIdeaButton({ tripId, idea }: { tripId: string; idea: IdeaWithState }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-full border border-border-subtle px-3.5 py-2 text-sm font-medium"
      >
        <Pencil size={14} /> Edit
      </button>
      <AddIdeaSheet
        key={idea.id}
        open={open}
        onClose={() => setOpen(false)}
        tripId={tripId}
        defaultDay={idea.day}
        idea={idea}
      />
    </>
  );
}
