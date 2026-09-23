'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Upload, Trash2, Loader2 } from 'lucide-react';
import { createBoardingPass, deleteBoardingPass } from '@/lib/actions/boarding-passes';
import { useCurrentUser } from '@/components/CurrentUserContext';
import { PROFILES } from '@/lib/profiles';
import type { BoardingPass, BoardingPassLeg, Flight, UserId } from '@/lib/types';

const LEGS: BoardingPassLeg[] = ['outbound', 'return'];
const USERS: UserId[] = ['rocky', 'vince'];

function Slot({
  tripId,
  userId,
  leg,
  pass,
  flightId,
}: {
  tripId: string;
  userId: UserId;
  leg: BoardingPassLeg;
  pass?: BoardingPass;
  flightId: string | null;
}) {
  const me = useCurrentUser();
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const fileInput = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('folder', 'boarding-passes');
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      if (!res.ok) throw new Error();
      const { url, fileType } = await res.json();
      await createBoardingPass({ trip_id: tripId, flight_id: flightId, leg, file_url: url, file_type: fileType });
      router.refresh();
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = '';
    }
  }

  function handleDelete() {
    if (!pass) return;
    startTransition(async () => {
      await deleteBoardingPass(pass.id);
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border-subtle bg-surface p-3.5">
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
        style={{ backgroundColor: PROFILES[userId].avatar_color }}
      >
        {PROFILES[userId].display_name[0]}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{PROFILES[userId].display_name}</p>
        <p className="text-xs text-muted capitalize">{leg} boarding pass</p>
      </div>

      {pass ? (
        <div className="flex items-center gap-2">
          <a
            href={pass.file_url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 rounded-full bg-[#f2ede4] px-3 py-1.5 text-xs font-semibold"
          >
            <FileText size={13} /> View
          </a>
          {pass.user_id === me && (
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="p-1.5 text-muted"
              aria-label="Delete boarding pass"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      ) : (
        <button
          onClick={() => fileInput.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1 rounded-full border border-border-subtle px-3 py-1.5 text-xs font-semibold"
        >
          {uploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
          Upload
        </button>
      )}
      <input ref={fileInput} type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFile} />
    </div>
  );
}

export function BoardingPassesList({
  tripId,
  passes,
  flights,
}: {
  tripId: string;
  passes: BoardingPass[];
  flights: Flight[];
}) {
  const outboundFlightId = flights[0]?.id ?? null;
  const returnFlightId = flights.length > 1 ? flights[flights.length - 1].id : outboundFlightId;

  return (
    <div className="space-y-2.5 px-4 pb-4">
      {LEGS.map((leg) =>
        USERS.map((userId) => (
          <Slot
            key={`${leg}-${userId}`}
            tripId={tripId}
            userId={userId}
            leg={leg}
            pass={passes.find((p) => p.leg === leg && p.user_id === userId)}
            flightId={leg === 'outbound' ? outboundFlightId : returnFlightId}
          />
        ))
      )}
    </div>
  );
}
