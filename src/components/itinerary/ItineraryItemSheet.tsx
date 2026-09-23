'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Sheet } from '@/components/Sheet';
import { updateItineraryItem } from '@/lib/actions/itinerary';
import { DAYS, DAY_LABELS, ITINERARY_STATUSES, type Day, type ItineraryStatus } from '@/lib/types';
import { formLabel, formInput, formRow, formButtonPrimary } from '@/lib/form-styles';
import type { ItineraryItemWithIdea } from '@/lib/data/itinerary';

const STATUS_LABELS: Record<ItineraryStatus, string> = {
  maybe: 'Maybe',
  locked_in: 'Locked in',
  booked: 'Booked',
};

export function ItineraryItemSheet({
  open,
  onClose,
  item,
}: {
  open: boolean;
  onClose: () => void;
  item: ItineraryItemWithIdea;
}) {
  const router = useRouter();
  const [day, setDay] = useState<Day>(item.day);
  const [startTime, setStartTime] = useState(item.start_time?.slice(0, 5) ?? '');
  const [endTime, setEndTime] = useState(item.end_time?.slice(0, 5) ?? '');
  const [status, setStatus] = useState<ItineraryStatus>(item.status);
  const [notes, setNotes] = useState(item.notes ?? '');
  const [bookingInfo, setBookingInfo] = useState(item.booking_info ?? '');
  const [isSaving, startSaving] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startSaving(async () => {
      await updateItineraryItem(item.id, {
        day,
        start_time: startTime || null,
        end_time: endTime || null,
        status,
        notes: notes.trim() || null,
        booking_info: bookingInfo.trim() || null,
      });
      onClose();
      router.refresh();
    });
  }

  return (
    <Sheet open={open} onClose={onClose} title={item.idea.name}>
      <form onSubmit={handleSubmit}>
        <div className={`${formRow} grid grid-cols-2 gap-3`}>
          <div>
            <label className={formLabel} htmlFor="item-day">
              Day
            </label>
            <select
              id="item-day"
              value={day}
              onChange={(e) => setDay(e.target.value as Day)}
              className={formInput}
            >
              {DAYS.map((d) => (
                <option key={d} value={d}>
                  {DAY_LABELS[d]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={formLabel} htmlFor="item-status">
              Status
            </label>
            <select
              id="item-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as ItineraryStatus)}
              className={formInput}
            >
              {ITINERARY_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={`${formRow} grid grid-cols-2 gap-3`}>
          <div>
            <label className={formLabel} htmlFor="item-start">
              Start time
            </label>
            <input
              id="item-start"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className={formInput}
            />
          </div>
          <div>
            <label className={formLabel} htmlFor="item-end">
              End time (optional)
            </label>
            <input
              id="item-end"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className={formInput}
            />
          </div>
        </div>
        {!startTime && (
          <p className="-mt-2 mb-4 text-xs text-muted">
            No start time yet — this stays in Unscheduled until you set one.
          </p>
        )}

        <div className={formRow}>
          <label className={formLabel} htmlFor="item-booking">
            Booking info
          </label>
          <input
            id="item-booking"
            value={bookingInfo}
            onChange={(e) => setBookingInfo(e.target.value)}
            placeholder="Confirmation number, table name…"
            className={formInput}
          />
        </div>

        <div className={formRow}>
          <label className={formLabel} htmlFor="item-notes">
            Notes
          </label>
          <textarea
            id="item-notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={formInput}
          />
        </div>

        <button type="submit" disabled={isSaving} className={formButtonPrimary}>
          {isSaving ? 'Saving…' : 'Save'}
        </button>
      </form>
    </Sheet>
  );
}
