'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { Sheet } from '@/components/Sheet';
import { createAccommodation, deleteAccommodation, updateAccommodation } from '@/lib/actions/accommodation';
import { formLabel, formInput, formRow, formButtonPrimary } from '@/lib/form-styles';
import type { Accommodation } from '@/lib/types';

export function AccommodationSheet({
  open,
  onClose,
  tripId,
  stay,
}: {
  open: boolean;
  onClose: () => void;
  tripId: string;
  stay?: Accommodation;
}) {
  const router = useRouter();
  const isEdit = Boolean(stay);
  const [name, setName] = useState(stay?.name ?? '');
  const [address, setAddress] = useState(stay?.address ?? '');
  const [checkIn, setCheckIn] = useState(stay?.check_in ?? '');
  const [checkOut, setCheckOut] = useState(stay?.check_out ?? '');
  const [bookingRef, setBookingRef] = useState(stay?.booking_reference ?? '');
  const [bookingUrl, setBookingUrl] = useState(stay?.booking_url ?? '');
  const [notes, setNotes] = useState(stay?.notes ?? '');
  const [imageUrl, setImageUrl] = useState(stay?.image_url ?? null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, startSaving] = useTransition();
  const fileInput = useRef<HTMLInputElement>(null);

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('folder', 'accommodation');
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      if (!res.ok) throw new Error();
      const { url } = await res.json();
      setImageUrl(url);
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = '';
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startSaving(async () => {
      try {
        const payload = {
          name: name.trim(),
          address: address.trim() || null,
          check_in: checkIn || null,
          check_out: checkOut || null,
          booking_reference: bookingRef.trim() || null,
          booking_url: bookingUrl.trim() || null,
          notes: notes.trim() || null,
          image_url: imageUrl,
        };
        if (isEdit && stay) {
          await updateAccommodation(stay.id, payload);
        } else {
          await createAccommodation({ ...payload, trip_id: tripId, latitude: null, longitude: null });
        }
        onClose();
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong.');
      }
    });
  }

  function handleDelete() {
    if (!stay) return;
    if (!confirm('Delete this accommodation?')) return;
    startSaving(async () => {
      await deleteAccommodation(stay.id);
      onClose();
      router.refresh();
    });
  }

  return (
    <Sheet open={open} onClose={onClose} title={isEdit ? 'Edit accommodation' : 'Add accommodation'}>
      <form onSubmit={handleSubmit}>
        <div className={formRow}>
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            className="relative flex aspect-[16/9] w-full items-center justify-center overflow-hidden rounded-2xl border border-dashed border-border-subtle bg-background"
          >
            {imageUrl ? (
              <Image src={imageUrl} alt="" fill unoptimized className="object-cover" />
            ) : uploading ? (
              <Loader2 size={22} className="animate-spin text-muted" />
            ) : (
              <span className="flex flex-col items-center gap-1.5 text-muted">
                <Camera size={20} strokeWidth={1.5} />
                <span className="text-xs">Add a photo</span>
              </span>
            )}
          </button>
          <input ref={fileInput} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
        </div>

        <div className={formRow}>
          <label className={formLabel} htmlFor="acc-name">
            Name
          </label>
          <input id="acc-name" required value={name} onChange={(e) => setName(e.target.value)} className={formInput} />
        </div>

        <div className={formRow}>
          <label className={formLabel} htmlFor="acc-address">
            Address
          </label>
          <input id="acc-address" value={address} onChange={(e) => setAddress(e.target.value)} className={formInput} />
        </div>

        <div className={`${formRow} grid grid-cols-2 gap-3`}>
          <div>
            <label className={formLabel} htmlFor="acc-checkin">
              Check-in
            </label>
            <input
              id="acc-checkin"
              type="date"
              value={checkIn ?? ''}
              onChange={(e) => setCheckIn(e.target.value)}
              className={formInput}
            />
          </div>
          <div>
            <label className={formLabel} htmlFor="acc-checkout">
              Check-out
            </label>
            <input
              id="acc-checkout"
              type="date"
              value={checkOut ?? ''}
              onChange={(e) => setCheckOut(e.target.value)}
              className={formInput}
            />
          </div>
        </div>

        <div className={formRow}>
          <label className={formLabel} htmlFor="acc-ref">
            Booking reference
          </label>
          <input id="acc-ref" value={bookingRef} onChange={(e) => setBookingRef(e.target.value)} className={formInput} />
        </div>

        <div className={formRow}>
          <label className={formLabel} htmlFor="acc-url">
            Booking link
          </label>
          <input id="acc-url" type="url" value={bookingUrl} onChange={(e) => setBookingUrl(e.target.value)} className={formInput} />
        </div>

        <div className={formRow}>
          <label className={formLabel} htmlFor="acc-notes">
            Notes
          </label>
          <textarea id="acc-notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} className={formInput} />
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
            Delete
          </button>
        )}
      </form>
    </Sheet>
  );
}
