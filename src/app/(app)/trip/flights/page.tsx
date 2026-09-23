import { getActiveTrip } from '@/lib/data/trip';
import { getFlights } from '@/lib/data/flights';
import { TripSubHeader } from '@/components/TripSubHeader';
import { FlightsList } from '@/components/trip/FlightsList';

export default async function FlightsPage() {
  const trip = await getActiveTrip();
  const flights = await getFlights(trip.id);

  return (
    <div>
      <TripSubHeader title="Flights" />
      <FlightsList tripId={trip.id} flights={flights} />
    </div>
  );
}
