import { getActiveTrip } from '@/lib/data/trip';
import { getBoardingPasses } from '@/lib/data/boarding-passes';
import { getFlights } from '@/lib/data/flights';
import { TripSubHeader } from '@/components/TripSubHeader';
import { BoardingPassesList } from '@/components/trip/BoardingPassesList';

export default async function BoardingPassesPage() {
  const trip = await getActiveTrip();
  const [passes, flights] = await Promise.all([getBoardingPasses(trip.id), getFlights(trip.id)]);

  return (
    <div>
      <TripSubHeader title="Boarding Passes" />
      <BoardingPassesList tripId={trip.id} passes={passes} flights={flights} />
    </div>
  );
}
