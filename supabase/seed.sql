-- Brisbane Weekend Planner — seed data
-- Run this AFTER schema.sql, once, in the Supabase SQL editor. Safe to
-- re-run (fixed UUIDs + upserts) if you want to reset back to the demo set.
-- NZ Labour Day 2026 is Monday 26 Oct — trip is Fri 23 Oct to Mon 26 Oct 2026.

insert into trips (id, name, start_date, end_date) values
  ('00000000-0000-0000-0000-000000000001', 'Brisbane', '2026-10-23', '2026-10-26')
on conflict (id) do update set start_date = excluded.start_date, end_date = excluded.end_date;

insert into ideas (id, trip_id, day, name, description, category, image_url, source_url, address, suburb, latitude, longitude, created_by) values
  ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000001', 'friday', 'Felons Brewing Co',
    'Riverside brewery under the story bridge, big outdoor deck.', 'drinks',
    'https://images.unsplash.com/photo-1523905330026-b8bd1f5f320e?w=800', 'https://felonsbrewingco.com.au',
    '5/60 Skyring Terrace, Newstead', 'Newstead', -27.4525, 153.0470, 'rocky'),
  ('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000001', 'friday', 'Gerard''s Bistro',
    'Middle-eastern share plates, always packed on a Friday.', 'food',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800', 'https://gerardsbistro.com.au',
    '15 James St, Fortitude Valley', 'Fortitude Valley', -27.4569, 153.0345, 'vince'),
  ('00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000001', 'friday', 'Death Before Decaf',
    'Coffee cart, good flat white before wandering James St.', 'coffee', null, null,
    'James St, Fortitude Valley', 'Fortitude Valley', -27.4571, 153.0343, 'rocky'),
  ('00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000001', 'saturday', 'South Bank Parklands',
    'Streets Beach, markets on Saturday morning, easy walk from the CBD.', 'sightseeing',
    'https://images.unsplash.com/photo-1595184461233-a3b98a7f9b46?w=800', 'https://southbankparklands.com.au',
    'South Bank Parklands', 'South Brisbane', -27.4748, 153.0217, 'vince'),
  ('00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000001', 'saturday', 'GOMA',
    'Gallery of Modern Art, free entry, worth a couple of hours.', 'sightseeing',
    'https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=800', 'https://qagoma.qld.gov.au',
    'Stanley Pl, South Brisbane', 'South Brisbane', -27.4676, 153.0186, 'rocky'),
  ('00000000-0000-0000-0000-000000000203', '00000000-0000-0000-0000-000000000001', 'saturday', 'Story Bridge Adventure Climb',
    'Climb the bridge at sunset, book ahead.', 'activity',
    'https://images.unsplash.com/photo-1516665717252-de6ae7e3ec93?w=800', 'https://sbac.net.au',
    '170 Main St, Kangaroo Point', 'Kangaroo Point', -27.4665, 153.0357, 'vince'),
  ('00000000-0000-0000-0000-000000000204', '00000000-0000-0000-0000-000000000001', 'saturday', 'Byblos Bar',
    'Rooftop, good for a pre-dinner drink.', 'nightlife', null, null,
    '30 Macrossan St, Brisbane City', 'Brisbane City', -27.4689, 153.0257, 'rocky'),
  ('00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000001', 'sunday', 'Howard Smith Wharves',
    'Markets, riverside bars, easy Sunday session.', 'drinks',
    'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800', 'https://howardsmithwharves.com',
    '5 Boundary St, Brisbane City', 'Brisbane City', -27.4657, 153.0328, 'vince'),
  ('00000000-0000-0000-0000-000000000302', '00000000-0000-0000-0000-000000000001', 'sunday', 'Mount Coot-tha Lookout',
    'Best skyline view of the city, good for sunrise or sunset.', 'sightseeing',
    'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=800', null,
    'Sir Samuel Griffith Dr, Mount Coot-tha', 'Mount Coot-tha', -27.4762, 152.9530, 'rocky'),
  ('00000000-0000-0000-0000-000000000303', '00000000-0000-0000-0000-000000000001', 'sunday', 'Fish Lane',
    'Laneway food precinct behind South Bank, lots of small bars.', 'food',
    'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800', null,
    'Fish Ln, South Brisbane', 'South Brisbane', -27.4785, 153.0202, 'vince'),
  ('00000000-0000-0000-0000-000000000401', '00000000-0000-0000-0000-000000000001', 'monday', 'James Street Market',
    'Brunch spot before heading to the airport.', 'food',
    'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?w=800', null,
    '22 James St, Fortitude Valley', 'Fortitude Valley', -27.4573, 153.0349, 'rocky'),
  ('00000000-0000-0000-0000-000000000402', '00000000-0000-0000-0000-000000000001', 'monday', 'New Farm Park',
    'Jacarandas if timing lines up, nice riverside walk.', 'sightseeing', null, null,
    'New Farm Park, New Farm', 'New Farm', -27.4671, 153.0453, 'vince')
on conflict (id) do nothing;

-- A few stars so the Actual tab has something to show immediately.
insert into stars (idea_id, user_id) values
  ('00000000-0000-0000-0000-000000000201', 'rocky'),
  ('00000000-0000-0000-0000-000000000201', 'vince'),
  ('00000000-0000-0000-0000-000000000203', 'vince'),
  ('00000000-0000-0000-0000-000000000301', 'rocky'),
  ('00000000-0000-0000-0000-000000000101', 'rocky')
on conflict do nothing;

-- Matching itinerary_items for the starred ideas above (this is normally
-- done automatically by the star server action — seeded directly here).
insert into itinerary_items (idea_id, trip_id, day, start_time, status, position) values
  ('00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000001', 'saturday', '10:00', 'locked_in', 1),
  ('00000000-0000-0000-0000-000000000203', '00000000-0000-0000-0000-000000000001', 'saturday', '17:30', 'booked', 2),
  ('00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000001', 'sunday', null, 'maybe', 1),
  ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000001', 'friday', '18:00', 'locked_in', 1)
on conflict (idea_id) do nothing;

insert into comments (idea_id, user_id, content) values
  ('00000000-0000-0000-0000-000000000201', 'vince', 'Could do this before lunch, markets are usually done by 2.'),
  ('00000000-0000-0000-0000-000000000203', 'rocky', 'Booked for sunset already, sun sets ~5:45pm end of Oct.'),
  ('00000000-0000-0000-0000-000000000301', 'vince', 'Good one for the last night, close to the hotel too.')
on conflict do nothing;

insert into flights (id, trip_id, airline, flight_number, departure_airport, arrival_airport, departure_time, arrival_time, booking_reference) values
  ('00000000-0000-0000-0000-000000000501', '00000000-0000-0000-0000-000000000001', 'Air New Zealand', 'NZ135', 'AKL', 'BNE', '2026-10-23T07:15:00+13:00', '2026-10-23T09:05:00+10:00', 'ABC123'),
  ('00000000-0000-0000-0000-000000000502', '00000000-0000-0000-0000-000000000001', 'Air New Zealand', 'NZ136', 'BNE', 'AKL', '2026-10-26T18:20:00+10:00', '2026-10-27T01:15:00+13:00', 'ABC123')
on conflict (id) do nothing;

insert into accommodation (id, trip_id, name, address, latitude, longitude, check_in, check_out, booking_reference) values
  ('00000000-0000-0000-0000-000000000601', '00000000-0000-0000-0000-000000000001', 'Ovolo Inchcolm', '73 Wickham Terrace, Brisbane City', -27.4657, 153.0264, '2026-10-23', '2026-10-26', 'HTL456')
on conflict (id) do nothing;

insert into expenses (trip_id, name, category, amount, paid_by, split_type, status, note) values
  ('00000000-0000-0000-0000-000000000001', 'Flights', 'flights', 1240.00, 'rocky', 'equal', 'actual', 'Both return fares'),
  ('00000000-0000-0000-0000-000000000001', 'Hotel (3 nights)', 'accommodation', 780.00, 'vince', 'equal', 'actual', null),
  ('00000000-0000-0000-0000-000000000001', 'Story Bridge Climb', 'activities', 189.00, 'vince', 'equal', 'estimated', 'Twilight climb, 2 people')
on conflict do nothing;
