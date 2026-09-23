import { getActiveTrip } from '@/lib/data/trip';
import { getIdeasForTrip } from '@/lib/data/ideas';
import { DaySelector } from '@/components/DaySelector';
import { IdeaCard } from '@/components/IdeaCard';
import { AddIdeaButton } from '@/components/AddIdeaButton';
import { RealtimeRefresher } from '@/components/RealtimeRefresher';
import { DAYS, type Day } from '@/lib/types';

export default async function PlanningPage(props: PageProps<'/planning'>) {
  const searchParams = await props.searchParams;
  const dayParam = typeof searchParams.day === 'string' ? searchParams.day : undefined;
  const day: Day = DAYS.includes(dayParam as Day) ? (dayParam as Day) : 'friday';

  const trip = await getActiveTrip();
  const ideas = await getIdeasForTrip(trip.id, day);

  return (
    <div className="pb-4">
      <RealtimeRefresher tables={['ideas', 'stars', 'comments', 'itinerary_items']} />

      <header className="px-4 pt-6 pb-1">
        <h1 className="text-2xl font-semibold tracking-tight">Planning</h1>
        <p className="text-sm text-muted">Throw ideas in, star the ones you&apos;re keen on.</p>
      </header>

      <DaySelector basePath="/planning" activeDay={day} tripStartDate={trip.start_date} />

      {ideas.length === 0 ? (
        <div className="mx-4 mt-8 rounded-3xl border border-dashed border-border-subtle p-8 text-center">
          <p className="text-sm text-muted">
            Nothing for this day yet — tap &quot;Add idea&quot; to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 px-4 pt-4">
          {ideas.map((idea) => (
            <IdeaCard key={idea.id} idea={idea} />
          ))}
        </div>
      )}

      <AddIdeaButton tripId={trip.id} day={day} />
    </div>
  );
}
