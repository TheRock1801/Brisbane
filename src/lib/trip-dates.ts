import { addDays, differenceInCalendarDays, parseISO, set } from 'date-fns';
import { DAYS, type Day } from '@/lib/types';

/** Maps "today" onto one of the trip's four days, falling back to Friday outside the trip window. */
export function currentTripDay(tripStartDate: string): Day {
  const offset = differenceInCalendarDays(new Date(), parseISO(tripStartDate));
  return DAYS[offset] ?? 'friday';
}

export function daysUntil(tripStartDate: string): number {
  return differenceInCalendarDays(parseISO(tripStartDate), new Date());
}

/** Combines the trip's start date + a Day + an "HH:mm[:ss]" string into a real Date. */
export function itemDateTime(tripStartDate: string, day: Day, time: string): Date {
  const dayIndex = DAYS.indexOf(day);
  const date = addDays(parseISO(tripStartDate), dayIndex);
  const [hours, minutes] = time.split(':').map(Number);
  return set(date, { hours, minutes, seconds: 0, milliseconds: 0 });
}
