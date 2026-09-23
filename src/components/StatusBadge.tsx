import type { ItineraryStatus } from '@/lib/types';
import { cn } from '@/lib/cn';

const STYLES: Record<ItineraryStatus, string> = {
  maybe: 'bg-[#EEF2F7] text-[#5c6b7c]',
  locked_in: 'bg-[#E3F3F1] text-[#167d89]',
  booked: 'bg-[#FCEAE3] text-[#c4453f]',
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
