import { getActiveTrip } from '@/lib/data/trip';
import { getWifeCandidates } from '@/lib/data/wife-candidates';
import { WifeCandidateList } from '@/components/WifeCandidateList';

export default async function WifePage() {
  const trip = await getActiveTrip();
  const candidates = await getWifeCandidates(trip.id);

  return (
    <div className="pb-4">
      <header className="px-4 pt-6 pb-1">
        <h1 className="text-2xl font-semibold tracking-tight">Find Vince a Wife</h1>
        <p className="text-sm text-muted">Everyone you meet, ranked.</p>
      </header>

      <div className="mt-4">
        <WifeCandidateList tripId={trip.id} candidates={candidates} />
      </div>
    </div>
  );
}
