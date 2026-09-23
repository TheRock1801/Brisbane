import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export function TripSubHeader({ title, backHref = '/trip' }: { title: string; backHref?: string }) {
  return (
    <header className="flex items-center gap-2 px-2 pt-6 pb-2">
      <Link
        href={backHref}
        className="flex h-9 w-9 items-center justify-center rounded-full text-muted"
        aria-label="Back"
      >
        <ChevronLeft size={22} />
      </Link>
      <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
    </header>
  );
}
