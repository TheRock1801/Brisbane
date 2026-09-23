'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Plane, Plus } from 'lucide-react';
import { FlightSheet } from '@/components/trip/FlightSheet';
import { formButtonPrimary } from '@/lib/form-styles';
import type { Flight } from '@/lib/types';

function FlightCard({ flight, onEdit }: { flight: Flight; onEdit: () => void }) {
  return (
    <button
      onClick={onEdit}
      className="w-full rounded-3xl border border-border-subtle bg-surface p-4 text-left active:scale-[0.98]"
    >
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm font-semibold text-muted">
          <Plane size={16} /> {flight.airline} {flight.flight_number}
        </span>
        {flight.booking_reference && (
          <span className="text-xs font-medium text-muted">{flight.booking_reference}</span>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div>
          <p className="text-2xl font-semibold">{flight.departure_airport}</p>
          <p className="text-xs text-muted">{format(new Date(flight.departure_time), 'EEE d MMM, HH:mm')}</p>
        </div>
        <div className="flex-1 px-3">
          <div className="h-px w-full border-t border-dashed border-border-subtle" />
        </div>
        <div className="text-right">
          <p className="text-2xl font-semibold">{flight.arrival_airport}</p>
          <p className="text-xs text-muted">{format(new Date(flight.arrival_time), 'EEE d MMM, HH:mm')}</p>
        </div>
      </div>

      {flight.notes && <p className="mt-3 text-sm text-muted">{flight.notes}</p>}
    </button>
  );
}

export function FlightsList({ tripId, flights }: { tripId: string; flights: Flight[] }) {
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<Flight | null>(null);

  return (
    <div className="px-4 pb-4">
      <div className="space-y-3">
        {flights.map((f) => (
          <FlightCard key={f.id} flight={f} onEdit={() => setEditing(f)} />
        ))}
      </div>

      {flights.length === 0 && (
        <p className="mt-4 text-center text-sm text-muted">No flights added yet.</p>
      )}

      <button onClick={() => setAddOpen(true)} className={`${formButtonPrimary} mt-4 flex items-center justify-center gap-2`}>
        <Plus size={18} /> Add flight
      </button>

      <FlightSheet open={addOpen} onClose={() => setAddOpen(false)} tripId={tripId} />
      {editing && (
        <FlightSheet
          key={editing.id}
          open
          onClose={() => setEditing(null)}
          tripId={tripId}
          flight={editing}
        />
      )}
    </div>
  );
}
