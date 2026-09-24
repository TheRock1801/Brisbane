'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
import { Sheet } from '@/components/Sheet';
import { createWifeCandidate, deleteWifeCandidate, updateWifeCandidate } from '@/lib/actions/wife-candidates';
import { formLabel, formInput, formRow, formButtonPrimary } from '@/lib/form-styles';
import { cn } from '@/lib/cn';
import type { WifeCandidate } from '@/lib/types';

function RankingPicker({ value, onChange }: { value: number | null; onChange: (n: number | null) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(value === n ? null : n)}
          aria-label={`Rank ${n} out of 10`}
          className="flex h-8 w-8 items-center justify-center rounded-full"
        >
          <Heart
            size={20}
            strokeWidth={1.8}
            className={cn(value !== null && n <= value ? 'fill-accent text-accent' : 'text-muted')}
          />
        </button>
      ))}
    </div>
  );
}

export function WifeCandidateSheet({
  open,
  onClose,
  tripId,
  candidate,
}: {
  open: boolean;
  onClose: () => void;
  tripId: string;
  candidate?: WifeCandidate;
}) {
  const router = useRouter();
  const isEdit = Boolean(candidate);
  const [name, setName] = useState(candidate?.name ?? '');
  const [age, setAge] = useState(candidate?.age != null ? String(candidate.age) : '');
  const [phone, setPhone] = useState(candidate?.phone ?? '');
  const [ranking, setRanking] = useState<number | null>(candidate?.ranking ?? null);
  const [notes, setNotes] = useState(candidate?.notes ?? '');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, startSaving] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startSaving(async () => {
      try {
        const payload = {
          name: name.trim(),
          age: age.trim() ? Number(age) : null,
          phone: phone.trim() || null,
          ranking,
          notes: notes.trim() || null,
        };
        if (isEdit && candidate) {
          await updateWifeCandidate(candidate.id, payload);
        } else {
          await createWifeCandidate({ ...payload, trip_id: tripId });
        }
        onClose();
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong.');
      }
    });
  }

  function handleDelete() {
    if (!candidate) return;
    if (!confirm(`Remove ${candidate.name}?`)) return;
    startSaving(async () => {
      await deleteWifeCandidate(candidate.id);
      onClose();
      router.refresh();
    });
  }

  return (
    <Sheet open={open} onClose={onClose} title={isEdit ? 'Edit candidate' : 'Add candidate'}>
      <form onSubmit={handleSubmit}>
        <div className={formRow}>
          <label className={formLabel} htmlFor="wife-name">
            Name
          </label>
          <input id="wife-name" required value={name} onChange={(e) => setName(e.target.value)} className={formInput} />
        </div>

        <div className={`${formRow} grid grid-cols-2 gap-3`}>
          <div>
            <label className={formLabel} htmlFor="wife-age">
              Age
            </label>
            <input
              id="wife-age"
              type="number"
              inputMode="numeric"
              min={0}
              max={130}
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className={formInput}
            />
          </div>
          <div>
            <label className={formLabel} htmlFor="wife-phone">
              Phone
            </label>
            <input
              id="wife-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={formInput}
            />
          </div>
        </div>

        <div className={formRow}>
          <label className={formLabel}>Ranking</label>
          <RankingPicker value={ranking} onChange={setRanking} />
        </div>

        <div className={formRow}>
          <label className={formLabel} htmlFor="wife-notes">
            Notes
          </label>
          <textarea
            id="wife-notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={formInput}
          />
        </div>

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        <button type="submit" disabled={isSaving} className={formButtonPrimary}>
          {isSaving ? 'Saving…' : 'Save'}
        </button>
        {isEdit && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isSaving}
            className="mt-3 w-full text-center text-sm font-medium text-red-600"
          >
            Remove
          </button>
        )}
      </form>
    </Sheet>
  );
}
