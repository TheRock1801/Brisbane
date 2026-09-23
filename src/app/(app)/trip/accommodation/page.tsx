import { getActiveTrip } from '@/lib/data/trip';
import { getAccommodation } from '@/lib/data/accommodation';
import { TripSubHeader } from '@/components/TripSubHeader';
import { AccommodationList } from '@/components/trip/AccommodationList';

export default async function AccommodationPage() {
  const trip = await getActiveTrip();
  const stays = await getAccommodation(trip.id);

  return (
    <div>
      <TripSubHeader title="Accommodation" />
      <AccommodationList tripId={trip.id} stays={stays} />
    </div>
  );
}
