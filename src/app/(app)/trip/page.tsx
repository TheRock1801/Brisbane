import Link from 'next/link';
import { Plane, Ticket, BedDouble, Wallet, ChevronRight } from 'lucide-react';

const LINKS = [
  { href: '/trip/flights', label: 'Flights', icon: Plane, description: 'Departures, arrivals, booking refs' },
  { href: '/trip/boarding-passes', label: 'Boarding Passes', icon: Ticket, description: 'Upload and access on the go' },
  { href: '/trip/accommodation', label: 'Accommodation', icon: BedDouble, description: 'Where you’re staying' },
  { href: '/trip/budget', label: 'Budget', icon: Wallet, description: 'Track spend and who owes who' },
];

export default function TripHubPage() {
  return (
    <div className="pb-4">
      <header className="px-4 pt-6 pb-1">
        <h1 className="text-2xl font-semibold tracking-tight">Trip</h1>
        <p className="text-sm text-muted">The practical stuff.</p>
      </header>

      <div className="mt-4 space-y-2.5 px-4">
        {LINKS.map(({ href, label, icon: Icon, description }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3.5 rounded-2xl border border-border-subtle bg-surface p-4 active:scale-[0.98]"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f7f4ee]">
              <Icon size={20} strokeWidth={1.8} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-semibold">{label}</span>
              <span className="block truncate text-sm text-muted">{description}</span>
            </span>
            <ChevronRight size={18} className="shrink-0 text-muted" />
          </Link>
        ))}
      </div>
    </div>
  );
}
