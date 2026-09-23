@AGENTS.md

# Brisbane Weekend Planner

**Who:** Private app for Rocky and Vince, Brisbane Labour Weekend trip, Fri 23 Oct – Mon 26 Oct 2026.

**Path:** `C:/Users/rockyj/brisbane-weekend-planner`
**GitHub:** https://github.com/TheRock1801/Brisbane.git
**Deploy:** Vercel (not yet connected as of scaffolding — see below)
**Dev server:** `npm run dev`

**Stack:** Next.js 16 (App Router, Turbopack) + TypeScript + Tailwind CSS v4 | Supabase (Postgres + Storage + Realtime) | Mapbox GL JS | dnd-kit | Vercel

Next.js 16 has real breaking changes from earlier versions — `middleware.ts` is now `proxy.ts` (exported function named `proxy`), route props are typed via the generated `PageProps<'/route'>`/`LayoutProps<'/route'>` helpers (no manual `params`/`searchParams` typing), and there's a new `next/root-params` module for root-level dynamic segments (unused here — this app has no dynamic root segments). If something looks off vs. older Next.js knowledge, check `node_modules/next/dist/docs/` before assuming.

## Auth — deliberately simple

No Supabase Auth, no per-user accounts with passwords. `TRIP_PASSWORD` (env var) gates the whole app; after entering it you pick "Rocky" or "Vince" (`src/app/login/page.tsx` — a plain HTML form, no client JS needed). The choice is signed into an HMAC cookie (`src/lib/auth/session.ts`, secret is `SESSION_SECRET`) and read via `getSession()`/`useCurrentUser()` (`src/components/CurrentUserContext.tsx`) everywhere identity is needed. This was an explicit choice over full Supabase email/password accounts — see the two of you as the only ever users, no password-reset flow needed.

`src/proxy.ts` does a **presence-only** cookie check (Edge runtime can't run the HMAC verify — Node's `crypto` isn't available there) and bounces straight to `/login` if the cookie is missing. The `(app)` route group's `layout.tsx` does the real signature verification server-side and is the actual authority.

## Data model

Single-trip app (`getActiveTrip()` in `src/lib/data/trip.ts` just takes the first row in `trips` — that assumption lives in exactly one place if this ever needs multi-trip support). Full schema: `supabase/schema.sql`. Seed data: `supabase/seed.sql`. **No migration runner** — same pattern as other projects in this environment: paste the SQL into the Supabase SQL editor by hand, and any future schema change gets a new hand-run migration, not an ORM migration.

Users (`rocky`/`vince`) are a static two-row `profiles` table for the FK, but the app never queries it — `src/lib/profiles.ts`'s `PROFILES` constant is the actual source of truth for display name/avatar color, since it's two fixed rows that never change.

**Ideas → Starred → Actual is one record, not three.** An idea starts in `ideas`. The moment either of you stars it (`toggleStar` in `src/lib/actions/stars.ts`), a matching `itinerary_items` row is created automatically (status `maybe`, no time) — that's what makes a starred idea show up in Actual without duplicating it. Un-starring only deletes that row if it's still untouched (still `maybe`, no time, no notes, no booking info) — so accidentally un-starring something you'd already scheduled never throws away that work.

**Position governs order, not start_time.** Actual's Timeline and Unscheduled sections are both ordered by `itinerary_items.position` (drag-and-drop or the up/down buttons in `src/components/itinerary/SortableItineraryList.tsx` write this), not by `start_time`. An item counts as "scheduled" purely by having a `start_time` set — moving something from Unscheduled into the Timeline happens by opening it and giving it a time (`ItineraryItemSheet.tsx`), not by dragging it across sections. This was a deliberate simplification vs. the brief's literal "drag into the timeline" — true drag-between-containers-that-implies-a-time-slot would have been a lot more code for a two-person app where tapping "set a time" is just as fast.

## Map

`src/components/MapView.tsx` — client component, `mapbox-gl` with DOM `Marker`s (not a GeoJSON layer — the pin counts are small enough that this is simpler). Three independent layer toggles (Planning/Starred/Actual) work off the same `ideas` array: Planning = any idea without a star, Starred = starred but not yet in Actual (in practice every starred idea has an itinerary row already, so this mostly shows nothing extra — kept as its own toggle because the brief asked for three independent layers), Actual = has an itinerary row, colored by day (`src/lib/day-colors.ts`). Accommodation gets its own always-on square pin.

**Daily routes are straight lines between scheduled stops in time order, explicitly labeled "itinerary order, not a real navigation route"** — no routing API is wired up (would need Mapbox Directions API or similar, not set up). This matches the brief's own fallback instruction for when a routing API isn't available.

The idea detail page's map preview (`src/components/StaticMapPreview.tsx`) uses the Mapbox **Static Images API** (a plain `<img>` with a URL) instead of mounting a second live map instance — cheaper and avoids loading mapbox-gl's JS on every single idea page.

## What's real-time and what isn't

`src/components/RealtimeRefresher.tsx` subscribes to Supabase `postgres_changes` on the relevant tables per page and calls `router.refresh()` (debounced) on any change — that's "basic realtime subscriptions," not live cursors/live-typing. It's mounted on Planning, Actual, Map, and the idea detail page; not on Trip's sub-pages (flights/accommodation/budget/boarding passes are far less likely to be edited by both of you at the same instant, and it wasn't worth the extra subscription).

## Auth boundary on mutations

Every function in `src/lib/actions/*.ts` is a `'use server'` Server Action and calls `requireUser()` first — per Next.js 16's own security guidance, render-time gating (a button only rendered when logged in) is never a real boundary, since the action is reachable by anyone who can POST to it. Comment/boarding-pass edit-or-delete additionally check `.eq('user_id', userId)` server-side so "edit your own" can't be bypassed by calling the action directly with someone else's ID.

## File uploads

One public Supabase Storage bucket, `trip-files` (created by `schema.sql`). Public because the app itself is gated by the shared password and paths are random UUIDs — simplest option for a two-person private app, not a defensible security boundary if that threat model ever changes. `src/app/api/upload/route.ts` is the only write path (auth-checked, 15MB cap, image/PDF only); `TRIP_FILES_BUCKET` constant lives in `src/lib/supabase/server.ts`.

## Not yet done / needs Rocky

- **Supabase keys, Mapbox token, TRIP_PASSWORD, SESSION_SECRET** aren't set in `.env.local` yet (`NEXT_PUBLIC_SUPABASE_URL` is filled in, the rest are blank placeholders) — nothing that touches the database or the map can be exercised until these land.
- `supabase/schema.sql` and `supabase/seed.sql` haven't been run against the real Supabase project yet.
- Not deployed to Vercel yet — repo has a `git remote` set to `https://github.com/TheRock1801/Brisbane.git` but nothing's been pushed.
- Everything above was built and typechecked (`npm run build`, `npm run lint`) locally; the auth/redirect/error-boundary flow was smoke-tested via curl against a local dev server, but no page that touches real Supabase data or the real map has been exercised yet, since no credentials exist yet.
