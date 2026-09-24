-- Brisbane Weekend Planner — database schema
-- This project has no migration runner: paste this whole file into the
-- Supabase SQL editor (Project → SQL Editor → New query) and run it once.
-- Safe to re-run — every statement is idempotent (IF NOT EXISTS / OR REPLACE).

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Users are just the two of you. No Supabase Auth — the app gates entry with
-- a single shared trip password (see TRIP_PASSWORD env var) and you pick your
-- name after. This table exists so names/avatar colours aren't hardcoded in
-- every query, not because we expect a third person.
-- ---------------------------------------------------------------------------
create table if not exists profiles (
  id text primary key check (id in ('rocky', 'vince')),
  display_name text not null,
  avatar_color text not null
);

insert into profiles (id, display_name, avatar_color) values
  ('rocky', 'Rocky', '#E2725B'),
  ('vince', 'Vince', '#2E6E5E')
on conflict (id) do nothing;

create table if not exists trips (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  start_date date not null,
  end_date date not null,
  created_at timestamptz not null default now()
);

-- Single trip for V1. Seed data (seed.sql) inserts the Brisbane Labour
-- Weekend trip; every other table hangs off trip_id for future-proofing.

create table if not exists ideas (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  day text not null check (day in ('friday', 'saturday', 'sunday', 'monday')),
  name text not null,
  description text,
  category text not null default 'other'
    check (category in ('food', 'drinks', 'coffee', 'activity', 'shopping', 'sightseeing', 'nightlife', 'other')),
  image_url text,
  source_url text,
  address text,
  suburb text,
  latitude double precision,
  longitude double precision,
  created_by text not null references profiles(id),
  created_at timestamptz not null default now()
);

create index if not exists ideas_trip_day_idx on ideas (trip_id, day);

create table if not exists stars (
  idea_id uuid not null references ideas(id) on delete cascade,
  user_id text not null references profiles(id),
  created_at timestamptz not null default now(),
  primary key (idea_id, user_id)
);

create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  idea_id uuid not null references ideas(id) on delete cascade,
  user_id text not null references profiles(id),
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists comments_idea_idx on comments (idea_id, created_at);

-- One itinerary_items row per idea, created automatically the moment an idea
-- is starred (status defaults to 'maybe', unscheduled). This is what keeps
-- Planning/Actual/Map "views of the same record" per the brief — starring
-- never copies the idea, it just attaches scheduling info to it.
create table if not exists itinerary_items (
  id uuid primary key default gen_random_uuid(),
  idea_id uuid not null unique references ideas(id) on delete cascade,
  trip_id uuid not null references trips(id) on delete cascade,
  day text not null check (day in ('friday', 'saturday', 'sunday', 'monday')),
  start_time time,
  end_time time,
  status text not null default 'maybe' check (status in ('maybe', 'locked_in', 'booked')),
  position integer not null default 0,
  notes text,
  booking_info text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists itinerary_items_trip_day_idx on itinerary_items (trip_id, day, position);

create table if not exists flights (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  airline text not null,
  flight_number text not null,
  departure_airport text not null,
  arrival_airport text not null,
  departure_time timestamptz not null,
  arrival_time timestamptz not null,
  booking_reference text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists boarding_passes (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  flight_id uuid references flights(id) on delete set null,
  user_id text not null references profiles(id),
  leg text not null check (leg in ('outbound', 'return')),
  file_url text not null,
  file_type text not null check (file_type in ('image', 'pdf')),
  created_at timestamptz not null default now()
);

create table if not exists accommodation (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  name text not null,
  address text,
  latitude double precision,
  longitude double precision,
  check_in date,
  check_out date,
  booking_reference text,
  booking_url text,
  notes text,
  image_url text,
  created_at timestamptz not null default now()
);

-- "Find Vince a Wife" — a running list of people met on the trip, not tied to
-- any single idea/day, so it gets its own table rather than piggybacking on
-- ideas/comments.
create table if not exists wife_candidates (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  name text not null,
  age integer check (age is null or (age >= 0 and age <= 130)),
  phone text,
  connect_url text,
  looks integer check (looks is null or (looks >= 1 and looks <= 10)),
  wife_material integer check (wife_material is null or (wife_material >= 1 and wife_material <= 10)),
  personality integer check (personality is null or (personality >= 1 and personality <= 10)),
  notes text,
  created_by text not null references profiles(id),
  created_at timestamptz not null default now()
);

create index if not exists wife_candidates_trip_idx on wife_candidates (trip_id, created_at);

create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  name text not null,
  category text not null default 'other'
    check (category in ('flights', 'accommodation', 'food', 'drinks', 'activities', 'transport', 'shopping', 'other')),
  amount numeric(10, 2) not null,
  paid_by text not null references profiles(id),
  split_type text not null default 'equal' check (split_type in ('equal', 'rocky_only', 'vince_only')),
  status text not null default 'actual' check (status in ('estimated', 'actual')),
  note text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- RLS: anon (client-side, used only for realtime subscriptions) gets
-- read-only access. Every write goes through a Next.js server action using
-- the service role key, which bypasses RLS entirely — so no insert/update/
-- delete policies are needed at all.
-- ---------------------------------------------------------------------------
alter table profiles enable row level security;
alter table trips enable row level security;
alter table ideas enable row level security;
alter table stars enable row level security;
alter table comments enable row level security;
alter table itinerary_items enable row level security;
alter table flights enable row level security;
alter table boarding_passes enable row level security;
alter table accommodation enable row level security;
alter table expenses enable row level security;
alter table wife_candidates enable row level security;

drop policy if exists profiles_read on profiles;
create policy profiles_read on profiles for select using (true);

drop policy if exists trips_read on trips;
create policy trips_read on trips for select using (true);

drop policy if exists ideas_read on ideas;
create policy ideas_read on ideas for select using (true);

drop policy if exists stars_read on stars;
create policy stars_read on stars for select using (true);

drop policy if exists comments_read on comments;
create policy comments_read on comments for select using (true);

drop policy if exists itinerary_items_read on itinerary_items;
create policy itinerary_items_read on itinerary_items for select using (true);

drop policy if exists flights_read on flights;
create policy flights_read on flights for select using (true);

drop policy if exists boarding_passes_read on boarding_passes;
create policy boarding_passes_read on boarding_passes for select using (true);

drop policy if exists accommodation_read on accommodation;
create policy accommodation_read on accommodation for select using (true);

drop policy if exists expenses_read on expenses;
create policy expenses_read on expenses for select using (true);

drop policy if exists wife_candidates_read on wife_candidates;
create policy wife_candidates_read on wife_candidates for select using (true);

-- ---------------------------------------------------------------------------
-- Storage: one public bucket for idea photos, accommodation images, and
-- boarding passes. Public because the app itself is gated by the shared
-- trip password and object paths are random UUIDs — simplest option for a
-- 2-person private trip app. Run this after the bucket exists (create it
-- once from Storage → New bucket → name "trip-files" → Public bucket, or
-- this insert does it for you).
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('trip-files', 'trip-files', true)
on conflict (id) do nothing;

drop policy if exists trip_files_public_read on storage.objects;
create policy trip_files_public_read on storage.objects
  for select using (bucket_id = 'trip-files');
