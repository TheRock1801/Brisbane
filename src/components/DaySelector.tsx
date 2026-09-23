import Link from 'next/link';
import { addDays, format, parseISO } from 'date-fns';
import { DAYS, DAY_LABELS, type Day } from '@/lib/types';
import { cn } from '@/lib/cn';

export function DaySelector({
  basePath,
  activeDay,
  tripStartDate,
}: {
  basePath: string;
  activeDay: Day;
  tripStartDate: string;
}) {
  const start = parseISO(tripStartDate);

  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-1 pt-2">
      {DAYS.map((day, i) => {
        const active = day === activeDay;
        const date = addDays(start, i);
        return (
          <Link
            key={day}
            href={`${basePath}?day=${day}`}
            className={cn(
              'flex shrink-0 flex-col items-center rounded-2xl px-4 py-2 text-center transition',
              active ? 'bg-accent text-accent-foreground' : 'bg-surface border border-border-subtle text-foreground'
            )}
          >
            <span className="text-sm font-semibold">{DAY_LABELS[day]}</span>
            <span className={cn('text-[11px]', active ? 'text-white/85' : 'text-muted')}>
              {format(date, 'MMM d')}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
