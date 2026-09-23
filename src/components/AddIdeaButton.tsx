'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { AddIdeaSheet } from '@/components/AddIdeaSheet';
import type { Day } from '@/lib/types';

export function AddIdeaButton({ tripId, day }: { tripId: string; day: Day }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-4 z-30 flex items-center gap-2 rounded-full bg-accent px-5 py-3.5 text-white shadow-lg active:scale-95"
        aria-label="Add idea"
      >
        <Plus size={20} strokeWidth={2.5} />
        <span className="text-sm font-semibold">Add idea</span>
      </button>
      <AddIdeaSheet open={open} onClose={() => setOpen(false)} tripId={tripId} defaultDay={day} />
    </>
  );
}
