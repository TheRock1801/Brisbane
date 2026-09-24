'use client';

import { useState } from 'react';
import { Heart, Phone, Plus, User } from 'lucide-react';
import { WifeCandidateSheet } from '@/components/WifeCandidateSheet';
import { formButtonPrimary } from '@/lib/form-styles';
import type { WifeCandidate } from '@/lib/types';

function RankingBadge({ ranking }: { ranking: number | null }) {
  if (ranking == null) return null;
  return (
    <span className="flex shrink-0 items-center gap-1 rounded-full bg-[#FCEAE3] px-2.5 py-1 text-xs font-semibold text-[#c4453f]">
      <Heart size={12} className="fill-current" /> {ranking}/10
    </span>
  );
}

function CandidateCard({ candidate, onEdit }: { candidate: WifeCandidate; onEdit: () => void }) {
  return (
    <button
      onClick={onEdit}
      className="flex w-full items-start gap-3.5 rounded-2xl border border-border-subtle bg-surface p-4 text-left active:scale-[0.98]"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#EEF2F7]">
        <User size={20} strokeWidth={1.8} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-2">
          <span className="truncate text-[15px] font-semibold">{candidate.name}</span>
          <RankingBadge ranking={candidate.ranking} />
        </span>
        <span className="mt-0.5 block text-sm text-muted">
          {candidate.age != null ? `${candidate.age} years old` : null}
          {candidate.age != null && candidate.phone ? ' · ' : null}
          {candidate.phone}
        </span>
        {candidate.notes && <span className="mt-1.5 block text-sm">{candidate.notes}</span>}
      </span>
    </button>
  );
}

export function WifeCandidateList({ tripId, candidates }: { tripId: string; candidates: WifeCandidate[] }) {
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<WifeCandidate | null>(null);

  return (
    <div className="space-y-3 px-4 pb-4">
      {candidates.map((candidate) => (
        <CandidateCard key={candidate.id} candidate={candidate} onEdit={() => setEditing(candidate)} />
      ))}

      {candidates.length === 0 && (
        <p className="flex flex-col items-center gap-2 py-8 text-center text-sm text-muted">
          <Phone size={22} strokeWidth={1.5} />
          No one on the list yet.
        </p>
      )}

      <button onClick={() => setAddOpen(true)} className={`${formButtonPrimary} flex items-center justify-center gap-2`}>
        <Plus size={18} /> Add someone
      </button>

      <WifeCandidateSheet open={addOpen} onClose={() => setAddOpen(false)} tripId={tripId} />
      {editing && (
        <WifeCandidateSheet key={editing.id} open onClose={() => setEditing(null)} tripId={tripId} candidate={editing} />
      )}
    </div>
  );
}
