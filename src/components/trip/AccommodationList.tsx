'use client';

import { useState } from 'react';
import Image from 'next/image';
import { format, parseISO } from 'date-fns';
import { BedDouble, ExternalLink, Plus } from 'lucide-react';
import { AccommodationSheet } from '@/components/trip/AccommodationSheet';
import { formButtonPrimary } from '@/lib/form-styles';
import type { Accommodation } from '@/lib/types';

function AccommodationCard({ stay, onEdit }: { stay: Accommodation; onEdit: () => void }) {
  return (
    <button
      onClick={onEdit}
      className="block w-full overflow-hidden rounded-3xl border border-border-subtle bg-surface text-left active:scale-[0.98]"
    >
      <div className="relative aspect-[16/9] w-full bg-[#f2ede4]">
        {stay.image_url ? (
          <Image src={stay.image_url} alt={stay.name} fill unoptimized className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-muted">
            <BedDouble size={28} strokeWidth={1.5} />
          </div>
        )}
      </div>
      <div className="p-4">
        <p className="text-[15px] font-semibold">{stay.name}</p>
        {stay.address && <p className="text-sm text-muted">{stay.address}</p>}
        {stay.check_in && stay.check_out && (
          <p className="mt-1.5 text-sm">
            {format(parseISO(stay.check_in), 'EEE d MMM')} – {format(parseISO(stay.check_out), 'EEE d MMM')}
          </p>
        )}
        {stay.booking_reference && (
          <p className="mt-1 text-xs text-muted">Ref: {stay.booking_reference}</p>
        )}
        {stay.booking_url && (
          <a
            href={stay.booking_url}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="mt-2 flex items-center gap-1 text-xs font-semibold text-accent"
          >
            <ExternalLink size={12} /> Booking link
          </a>
        )}
      </div>
    </button>
  );
}

export function AccommodationList({ tripId, stays }: { tripId: string; stays: Accommodation[] }) {
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<Accommodation | null>(null);

  return (
    <div className="space-y-3 px-4 pb-4">
      {stays.map((stay) => (
        <AccommodationCard key={stay.id} stay={stay} onEdit={() => setEditing(stay)} />
      ))}

      {stays.length === 0 && <p className="text-center text-sm text-muted">Nothing added yet.</p>}

      <button onClick={() => setAddOpen(true)} className={`${formButtonPrimary} flex items-center justify-center gap-2`}>
        <Plus size={18} /> Add accommodation
      </button>

      <AccommodationSheet open={addOpen} onClose={() => setAddOpen(false)} tripId={tripId} />
      {editing && (
        <AccommodationSheet key={editing.id} open onClose={() => setEditing(null)} tripId={tripId} stay={editing} />
      )}
    </div>
  );
}
