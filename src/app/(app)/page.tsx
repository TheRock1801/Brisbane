import Link from 'next/link';
import { format } from 'date-fns';
import { Plane, ChevronRight, LogOut } from 'lucide-react';
import { getActiveTrip } from '@/lib/data/trip';
import { getIdeasForTrip } from '@/lib/data/ideas';
import { getItineraryForTrip } from '@/lib/data/itinerary';
import { getFlights } from '@/lib/data/flights';
import { getExpenses } from '@/lib/data/expenses';
import { summarizeBudget } from '@/lib/budget';
import { currentTripDay, daysUntil, itemDateTime } from '@/lib/trip-dates';
import { getSession } from '@/lib/auth/session';
import { PROFILES } from '@/lib/profiles';
import { Avatar } from '@/components/Avatar';
import { StatusBadge } from '@/components/StatusBadge';
import { QuickActions } from '@/components/QuickActions';
import { DAY_LABELS } from '@/lib/types';

export default async function HomePage() {
  const trip = await getActiveTrip();
  const [ideas, itinerary, flights, expenses, me] = await Promise.all([
    getIdeasForTrip(trip.id),
    getItineraryForTrip(trip.id),
    getFlights(trip.id),
    getExpenses(trip.id),
    getSession(),
  ]);

  const starredCount = ideas.filter((i) => i.stars.length > 0).length;
  const confirmedCount = itinerary.filter((i) => i.status === 'booked').length;
  const budget = summarizeBudget(expenses);
  const today = currentTripDay(trip.start_date);
  const daysToGo = daysUntil(trip.start_date);

  const now = new Date();
  const nextUp = itinerary
    .filter((i) => i.start_time && (i.status === 'locked_in' || i.status === 'booked'))
    .map((i) => ({ item: i, at: itemDateTime(trip.start_date, i.day, i.start_time!) }))
    .filter((x) => x.at >= now)
    .sort((a, b) => a.at.getTime() - b.at.getTime())[0];

  return (
    <div className="pb-4">
      <header className="flex items-start justify-between px-4 pt-6">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-accent">Labour Weekend</p>
          <h1 className="text-4xl font-semibold tracking-tight">Brisbane</h1>
          <p className="mt-1 text-sm text-muted">
            {daysToGo > 0
              ? `${daysToGo} day${daysToGo === 1 ? '' : 's'} to go`
              : daysToGo === 0
                ? "It's today!"
                : 'Currently in Brisbane'}
          </p>
        </div>
        {me && (
          <div className="flex items-center gap-2">
            <Avatar userId={me} size={32} />
            <form action="/api/auth/logout" method="POST">
              <button type="submit" className="p-2 text-muted" aria-label="Log out">
                <LogOut size={16} />
              </button>
            </form>
          </div>
        )}
      </header>

      <div className="px-4 pt-5">
        <QuickActions tripId={trip.id} today={today} />
      </div>

      {nextUp && (
        <section className="px-4 pt-6">
          <h2 className="mb-2 text-sm font-semibold text-muted">Next up</h2>
          <Link
            href={`/idea/${nextUp.item.idea_id}`}
            className="flex items-center gap-3 rounded-3xl border border-border-subtle bg-surface p-4 active:scale-[0.98]"
          >
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-semibold">{nextUp.item.idea.name}</p>
              <p className="mt-0.5 text-sm text-muted">
                {DAY_LABELS[nextUp.item.day]} · {nextUp.item.start_time!.slice(0, 5)}
              </p>
              <div className="mt-1.5">
                <StatusBadge status={nextUp.item.status} />
              </div>
            </div>
            <ChevronRight size={18} className="shrink-0 text-muted" />
          </Link>
        </section>
      )}

      <section className="px-4 pt-6">
        <h2 className="mb-2 text-sm font-semibold text-muted">Trip snapshot</h2>
        <div className="grid grid-cols-2 gap-2.5">
          <SnapshotTile label="Ideas saved" value={ideas.length} />
          <SnapshotTile label="Starred" value={starredCount} />
          <SnapshotTile label="Confirmed bookings" value={confirmedCount} />
          <SnapshotTile label="Budgeted" value={`$${budget.total.toFixed(0)}`} />
        </div>
      </section>

      {flights.length > 0 && (
        <section className="px-4 pt-6">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-muted">Flights</h2>
            <Link href="/trip/flights" className="text-xs font-semibold text-accent">
              See all
            </Link>
          </div>
          <div className="space-y-2">
            {flights.slice(0, 2).map((f) => (
              <div key={f.id} className="flex items-center gap-3 rounded-2xl border border-border-subtle bg-surface p-3.5">
                <Plane size={18} className="shrink-0 text-muted" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">
                    {f.departure_airport} → {f.arrival_airport}
                  </p>
                  <p className="text-xs text-muted">{format(new Date(f.departure_time), 'EEE d MMM, HH:mm')}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <p className="px-4 pt-8 text-center text-xs text-muted">
        You&apos;re signed in as {PROFILES[me!].display_name}
      </p>
    </div>
  );
}

function SnapshotTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-border-subtle bg-surface p-4">
      <p className="text-2xl font-semibold">{value}</p>
      <p className="mt-0.5 text-xs text-muted">{label}</p>
    </div>
  );
}
