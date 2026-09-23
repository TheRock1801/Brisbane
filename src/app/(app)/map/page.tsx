import { getActiveTrip } from '@/lib/data/trip';
import { getIdeasForTrip } from '@/lib/data/ideas';
import { getAccommodation } from '@/lib/data/accommodation';
import { MapView } from '@/components/MapView';
import { RealtimeRefresher } from '@/components/RealtimeRefresher';

export default async function MapPage() {
  const trip = await getActiveTrip();
  const [ideas, accommodation] = await Promise.all([
    getIdeasForTrip(trip.id),
    getAccommodation(trip.id),
  ]);

  return (
    <div className="flex min-h-[calc(100dvh-6rem)] flex-col">
      <RealtimeRefresher tables={['ideas', 'stars', 'itinerary_items']} />

      <header className="px-4 pt-6 pb-1">
        <h1 className="text-2xl font-semibold tracking-tight">Map</h1>
        <p className="text-sm text-muted">Where everything is.</p>
      </header>

      <MapView ideas={ideas} accommodation={accommodation} />
    </div>
  );
}
