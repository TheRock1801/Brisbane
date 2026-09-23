'use client';

import { useRef, useState, useTransition } from 'react';
import Image from 'next/image';
import { Link2, Camera, Loader2, ImageOff } from 'lucide-react';
import { Sheet } from '@/components/Sheet';
import { createIdea, deleteIdea, updateIdea } from '@/lib/actions/ideas';
import { CATEGORIES, DAYS, DAY_LABELS, type Category, type Day, type IdeaWithState } from '@/lib/types';
import { CATEGORY_META } from '@/components/CategoryTag';
import { formLabel, formInput, formRow, formButtonPrimary } from '@/lib/form-styles';
import { useRouter } from 'next/navigation';

export function AddIdeaSheet({
  open,
  onClose,
  tripId,
  defaultDay,
  idea,
}: {
  open: boolean;
  onClose: () => void;
  tripId: string;
  defaultDay: Day;
  /** When set, the sheet edits this idea instead of creating a new one. */
  idea?: IdeaWithState;
}) {
  const isEdit = Boolean(idea);
  const router = useRouter();
  const [url, setUrl] = useState(idea?.source_url ?? '');
  const [name, setName] = useState(idea?.name ?? '');
  const [description, setDescription] = useState(idea?.description ?? '');
  const [category, setCategory] = useState<Category>(idea?.category ?? 'other');
  const [suburb, setSuburb] = useState(idea?.suburb ?? '');
  const [address, setAddress] = useState(idea?.address ?? '');
  const [day, setDay] = useState<Day>(idea?.day ?? defaultDay);
  const [sourceUrl, setSourceUrl] = useState<string | null>(idea?.source_url ?? null);
  const [imageUrl, setImageUrl] = useState<string | null>(idea?.image_url ?? null);

  const [fetching, setFetching] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, startSaving] = useTransition();
  const fileInput = useRef<HTMLInputElement>(null);

  function reset() {
    setUrl(idea?.source_url ?? '');
    setName(idea?.name ?? '');
    setDescription(idea?.description ?? '');
    setCategory(idea?.category ?? 'other');
    setSuburb(idea?.suburb ?? '');
    setAddress(idea?.address ?? '');
    setDay(idea?.day ?? defaultDay);
    setSourceUrl(idea?.source_url ?? null);
    setImageUrl(idea?.image_url ?? null);
    setError(null);
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleFetch() {
    if (!url.trim()) return;
    setFetching(true);
    setError(null);
    try {
      const res = await fetch('/api/ideas/parse-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });
      if (!res.ok) throw new Error();
      const parsed = await res.json();
      if (parsed.name) setName(parsed.name);
      if (parsed.description) setDescription(parsed.description);
      if (parsed.image_url) setImageUrl(parsed.image_url);
      if (parsed.address) setAddress(parsed.address);
      if (parsed.suburb) setSuburb(parsed.suburb);
      if (parsed.category) setCategory(parsed.category);
      setSourceUrl(parsed.source_url ?? url.trim());
    } catch {
      setSourceUrl(url.trim());
      setError("Couldn't read that link automatically — the URL's saved, fill in the rest below.");
    } finally {
      setFetching(false);
    }
  }

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('folder', 'ideas');
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      if (!res.ok) throw new Error();
      const { url: uploadedUrl } = await res.json();
      setImageUrl(uploadedUrl);
    } catch {
      setError("Couldn't upload that photo — try again.");
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = '';
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError('Give it a name at least.');
      return;
    }
    setError(null);
    startSaving(async () => {
      try {
        const payload = {
          day,
          name: name.trim(),
          description: description.trim() || null,
          category,
          image_url: imageUrl,
          source_url: sourceUrl,
          address: address.trim() || null,
          suburb: suburb.trim() || null,
        };
        if (isEdit && idea) {
          await updateIdea(idea.id, payload);
        } else {
          await createIdea({ ...payload, trip_id: tripId, latitude: null, longitude: null });
        }
        handleClose();
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong.');
      }
    });
  }

  function handleDelete() {
    if (!idea) return;
    if (!confirm(`Delete "${idea.name}"? This removes it from Planning and Actual for both of you.`)) return;
    startSaving(async () => {
      try {
        await deleteIdea(idea.id);
        handleClose();
        router.push('/planning');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong.');
      }
    });
  }

  return (
    <Sheet open={open} onClose={handleClose} title={isEdit ? 'Edit idea' : 'Add an idea'}>
      <form onSubmit={handleSubmit}>
        <div className={formRow}>
          <label className={formLabel} htmlFor="idea-url">
            Paste a link (optional)
          </label>
          <div className="flex gap-2">
            <input
              id="idea-url"
              type="url"
              inputMode="url"
              placeholder="Google Maps, Instagram, a website…"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className={formInput}
            />
            <button
              type="button"
              onClick={handleFetch}
              disabled={fetching || !url.trim()}
              className="flex shrink-0 items-center justify-center rounded-2xl bg-[#EEF2F7] px-4 text-foreground disabled:opacity-50"
              aria-label="Fetch details from link"
            >
              {fetching ? <Loader2 size={18} className="animate-spin" /> : <Link2 size={18} />}
            </button>
          </div>
        </div>

        <div className={formRow}>
          <span className={formLabel}>Photo</span>
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-2xl border border-dashed border-border-subtle bg-background"
          >
            {imageUrl ? (
              <Image src={imageUrl} alt="" fill unoptimized className="object-cover" />
            ) : uploading ? (
              <Loader2 size={24} className="animate-spin text-muted" />
            ) : (
              <span className="flex flex-col items-center gap-1.5 text-muted">
                <Camera size={22} strokeWidth={1.5} />
                <span className="text-xs">Tap to add a photo</span>
              </span>
            )}
          </button>
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhoto}
          />
          {imageUrl && !uploading && (
            <button
              type="button"
              onClick={() => setImageUrl(null)}
              className="mt-1.5 flex items-center gap-1 text-xs text-muted"
            >
              <ImageOff size={13} /> Remove photo
            </button>
          )}
        </div>

        <div className={formRow}>
          <label className={formLabel} htmlFor="idea-name">
            Name
          </label>
          <input
            id="idea-name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Felons Brewing Co"
            className={formInput}
          />
        </div>

        <div className={`${formRow} grid grid-cols-2 gap-3`}>
          <div>
            <label className={formLabel} htmlFor="idea-day">
              Day
            </label>
            <select
              id="idea-day"
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
            <label className={formLabel} htmlFor="idea-category">
              Category
            </label>
            <select
              id="idea-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className={formInput}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_META[c].label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={formRow}>
          <label className={formLabel} htmlFor="idea-suburb">
            Suburb
          </label>
          <input
            id="idea-suburb"
            value={suburb}
            onChange={(e) => setSuburb(e.target.value)}
            placeholder="e.g. Fortitude Valley"
            className={formInput}
          />
        </div>

        <div className={formRow}>
          <label className={formLabel} htmlFor="idea-address">
            Address
          </label>
          <input
            id="idea-address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className={formInput}
          />
        </div>

        <div className={formRow}>
          <label className={formLabel} htmlFor="idea-description">
            Notes
          </label>
          <textarea
            id="idea-description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={formInput}
          />
        </div>

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        <button type="submit" disabled={isSaving} className={formButtonPrimary}>
          {isSaving ? 'Saving…' : isEdit ? 'Save changes' : 'Save idea'}
        </button>

        {isEdit && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isSaving}
            className="mt-3 w-full text-center text-sm font-medium text-red-600"
          >
            Delete idea
          </button>
        )}
      </form>
    </Sheet>
  );
}
