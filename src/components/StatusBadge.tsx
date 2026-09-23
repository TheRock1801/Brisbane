import type { ItineraryStatus } from '@/lib/types';
import { cn } from '@/lib/cn';

const STYLES: Record<ItineraryStatus, string> = {
  maybe: 'bg-[#f2ede4] text-[#8a7c68]',
  locked_in: 'bg-[#e7f0ec] text-[#2e6e5e]',
  booked: 'bg-[#fbf0dd] text-[#a3711f]',
};

const LABELS: Record<ItineraryStatus, string> = {
  maybe: 'Maybe',
  locked_in: 'Locked in',
  booked: 'Booked',
};

export function StatusBadge({ status, className }: { status: ItineraryStatus; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium',
        STYLES[status],
        className
      )}
    >
      {LABELS[status]}
    </span>
  );
}
