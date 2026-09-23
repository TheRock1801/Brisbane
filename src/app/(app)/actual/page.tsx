import { getActiveTrip } from '@/lib/data/trip';
import { getItineraryForDay } from '@/lib/data/itinerary';
import { DaySelector } from '@/components/DaySelector';
import { SortableItineraryList } from '@/components/itinerary/SortableItineraryList';
import { RealtimeRefresher } from '@/components/RealtimeRefresher';
import { DAYS, type Day } from '@/lib/types';

export default async function ActualPage(props: PageProps<'/actual'>) {
  const searchParams = await props.searchParams;
  const dayParam = typeof searchParams.day === 'string' ? searchParams.day : undefined;
  const day: Day = DAYS.includes(dayParam as Day) ? (dayParam as Day) : 'friday';

  const trip = await getActiveTrip();
  const items = await getItineraryForDay(trip.id, day);

  const scheduled = items
    .filter((i) => i.start_time)
    .sort((a, b) => (a.start_time! < b.start_time! ? -1 : 1));
  const unscheduled = items.filter((i) => !i.start_time);

  return (
    <div className="pb-4">
      <RealtimeRefresher tables={['itinerary_items', 'ideas', 'stars']} />

      <header className="px-4 pt-6 pb-1">
        <h1 className="text-2xl font-semibold tracking-tight">Actual</h1>
        <p className="text-sm text-muted">The real itinerary — starred ideas land here.</p>
      </header>

      <DaySelector basePath="/actual" activeDay={day} tripStartDate={trip.start_date} />

      {items.length === 0 ? (
        <div className="mx-4 mt-8 rounded-3xl border border-dashed border-border-subtle p-8 text-center">
          <p className="text-sm text-muted">
            Nothing starred for this day yet. Star an idea in Planning and it&apos;ll show up here.
          </p>
        </div>
      ) : (
        <div className="px-4 pt-4">
          <section>
            <h2 className="mb-2 text-sm font-semibold text-muted">Timeline</h2>
            <SortableItineraryList items={scheduled} day={day} emptyLabel="Nothing scheduled yet." />
          </section>

          <section className="mt-6">
            <h2 className="mb-2 text-sm font-semibold text-muted">Unscheduled</h2>
            <SortableItineraryList
              items={unscheduled}
              day={day}
              emptyLabel="Everything's scheduled."
            />
          </section>
        </div>
      )}
    </div>
  );
}
