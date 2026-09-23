export type UserId = 'rocky' | 'vince';

export type Day = 'friday' | 'saturday' | 'sunday' | 'monday';

export const DAYS: Day[] = ['friday', 'saturday', 'sunday', 'monday'];

export const DAY_LABELS: Record<Day, string> = {
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
  monday: 'Monday',
};

export type Category =
  | 'food'
  | 'drinks'
  | 'coffee'
  | 'activity'
  | 'shopping'
  | 'sightseeing'
  | 'nightlife'
  | 'other';

export const CATEGORIES: Category[] = [
  'food',
  'drinks',
  'coffee',
  'activity',
  'shopping',
  'sightseeing',
  'nightlife',
  'other',
];

export type ItineraryStatus = 'maybe' | 'locked_in' | 'booked';

export type ExpenseCategory =
  | 'flights'
  | 'accommodation'
  | 'food'
  | 'drinks'
  | 'activities'
  | 'transport'
  | 'shopping'
  | 'other';

export type SplitType = 'equal' | 'rocky_only' | 'vince_only';
export type ExpenseStatus = 'estimated' | 'actual';
export type BoardingPassLeg = 'outbound' | 'return';
export type FileType = 'image' | 'pdf';

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'flights',
  'accommodation',
  'food',
  'drinks',
  'activities',
  'transport',
  'shopping',
  'other',
];

export const SPLIT_TYPES: SplitType[] = ['equal', 'rocky_only', 'vince_only'];
export const EXPENSE_STATUSES: ExpenseStatus[] = ['estimated', 'actual'];
export const ITINERARY_STATUSES: ItineraryStatus[] = ['maybe', 'locked_in', 'booked'];

export interface Profile {
  id: UserId;
  display_name: string;
  avatar_color: string;
}

export interface Trip {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  created_at: string;
}

export interface Idea {
  id: string;
  trip_id: string;
  day: Day;
  name: string;
  description: string | null;
  category: Category;
  image_url: string | null;
  source_url: string | null;
  address: string | null;
  suburb: string | null;
  latitude: number | null;
  longitude: number | null;
  created_by: UserId;
  created_at: string;
}

export interface Star {
  idea_id: string;
  user_id: UserId;
  created_at: string;
}

export interface Comment {
  id: string;
  idea_id: string;
  user_id: UserId;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface ItineraryItem {
  id: string;
  idea_id: string;
  trip_id: string;
  day: Day;
  start_time: string | null;
  end_time: string | null;
  status: ItineraryStatus;
  position: number;
  notes: string | null;
  booking_info: string | null;
  created_at: string;
  updated_at: string;
}

export interface Flight {
  id: string;
  trip_id: string;
  airline: string;
  flight_number: string;
  departure_airport: string;
  arrival_airport: string;
  departure_time: string;
  arrival_time: string;
  booking_reference: string | null;
  notes: string | null;
  created_at: string;
}

export interface BoardingPass {
  id: string;
  trip_id: string;
  flight_id: string | null;
  user_id: UserId;
  leg: BoardingPassLeg;
  file_url: string;
  file_type: FileType;
  created_at: string;
}

export interface Accommodation {
  id: string;
  trip_id: string;
  name: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  check_in: string | null;
  check_out: string | null;
  booking_reference: string | null;
  booking_url: string | null;
  notes: string | null;
  image_url: string | null;
  created_at: string;
}

export interface Expense {
  id: string;
  trip_id: string;
  name: string;
  category: ExpenseCategory;
  amount: number;
  paid_by: UserId;
  split_type: SplitType;
  status: ExpenseStatus;
  note: string | null;
  created_at: string;
}

/** An idea joined with its derived star/itinerary state — the shape most UI reads. */
export interface IdeaWithState extends Idea {
  stars: UserId[];
  comment_count: number;
  itinerary: ItineraryItem | null;
}
