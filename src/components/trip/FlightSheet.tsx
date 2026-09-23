'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Sheet } from '@/components/Sheet';
import { createFlight, deleteFlight, updateFlight } from '@/lib/actions/flights';
import { formLabel, formInput, formRow, formButtonPrimary } from '@/lib/form-styles';
import type { Flight } from '@/lib/types';

function toLocalInput(iso: string | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function FlightSheet({
  open,
  onClose,
  tripId,
  flight,
}: {
  open: boolean;
  onClose: () => void;
  tripId: string;
  flight?: Flight;
}) {
  const router = useRouter();
  const isEdit = Boolean(flight);
  const [airline, setAirline] = useState(flight?.airline ?? '');
  const [flightNumber, setFlightNumber] = useState(flight?.flight_number ?? '');
  const [departureAirport, setDepartureAirport] = useState(flight?.departure_airport ?? '');
  const [arrivalAirport, setArrivalAirport] = useState(flight?.arrival_airport ?? '');
  const [departureTime, setDepartureTime] = useState(toLocalInput(flight?.departure_time));
  const [arrivalTime, setArrivalTime] = useState(toLocalInput(flight?.arrival_time));
  const [bookingRef, setBookingRef] = useState(flight?.booking_reference ?? '');
  const [notes, setNotes] = useState(flight?.notes ?? '');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, startSaving] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startSaving(async () => {
      try {
        const payload = {
          airline: airline.trim(),
          flight_number: flightNumber.trim(),
          departure_airport: departureAirport.trim().toUpperCase(),
          arrival_airport: arrivalAirport.trim().toUpperCase(),
          departure_time: new Date(departureTime).toISOString(),
          arrival_time: new Date(arrivalTime).toISOString(),
          booking_reference: bookingRef.trim() || null,
          notes: notes.trim() || null,
        };
        if (isEdit && flight) {
          await updateFlight(flight.id, payload);
        } else {
          await createFlight({ ...payload, trip_id: tripId });
        }
        onClose();
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong.');
      }
    });
  }

  function handleDelete() {
    if (!flight) return;
    if (!confirm('Delete this flight?')) return;
    startSaving(async () => {
      await deleteFlight(flight.id);
      onClose();
      router.refresh();
    });
  }

  return (
    <Sheet open={open} onClose={onClose} title={isEdit ? 'Edit flight' : 'Add flight'}>
      <form onSubmit={handleSubmit}>
        <div className={`${formRow} grid grid-cols-2 gap-3`}>
          <div>
            <label className={formLabel} htmlFor="fl-airline">
              Airline
            </label>
            <input
              id="fl-airline"
              required
              value={airline}
              onChange={(e) => setAirline(e.target.value)}
              className={formInput}
            />
          </div>
          <div>
            <label className={formLabel} htmlFor="fl-number">
              Flight number
            </label>
            <input
              id="fl-number"
              required
              value={flightNumber}
              onChange={(e) => setFlightNumber(e.target.value)}
              className={formInput}
            />
          </div>
        </div>

        <div className={`${formRow} grid grid-cols-2 gap-3`}>
          <div>
            <label className={formLabel} htmlFor="fl-dep-airport">
              From
            </label>
            <input
              id="fl-dep-airport"
              required
              placeholder="AKL"
              value={departureAirport}
              onChange={(e) => setDepartureAirport(e.target.value)}
              className={formInput}
            />
          </div>
          <div>
            <label className={formLabel} htmlFor="fl-arr-airport">
              To
            </label>
            <input
              id="fl-arr-airport"
              required
              placeholder="BNE"
              value={arrivalAirport}
              onChange={(e) => setArrivalAirport(e.target.value)}
              className={formInput}
            />
          </div>
        </div>

        <div className={formRow}>
          <label className={formLabel} htmlFor="fl-dep-time">
            Departs
          </label>
          <input
            id="fl-dep-time"
            type="datetime-local"
            required
            value={departureTime}
            onChange={(e) => setDepartureTime(e.target.value)}
            className={formInput}
          />
        </div>

        <div className={formRow}>
          <label className={formLabel} htmlFor="fl-arr-time">
            Arrives
          </label>
          <input
            id="fl-arr-time"
            type="datetime-local"
            required
            value={arrivalTime}
            onChange={(e) => setArrivalTime(e.target.value)}
            className={formInput}
          />
        </div>

        <div className={formRow}>
          <label className={formLabel} htmlFor="fl-ref">
            Booking reference
          </label>
          <input
            id="fl-ref"
            value={bookingRef}
            onChange={(e) => setBookingRef(e.target.value)}
            className={formInput}
          />
        </div>

        <div className={formRow}>
          <label className={formLabel} htmlFor="fl-notes">
            Notes
          </label>
          <textarea
            id="fl-notes"
            rows={2}
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
            Delete flight
          </button>
        )}
      </form>
    </Sheet>
  );
}
