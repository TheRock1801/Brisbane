@AGENTS.md

# Brisbane Weekend Planner

**Who:** Private app for Rocky and Vince, Brisbane Labour Weekend trip, Fri 23 Oct – Mon 26 Oct 2026.

**Path:** `C:/Users/rockyj/brisbane-weekend-planner`
**GitHub:** https://github.com/TheRock1801/Brisbane.git
**Deploy:** Vercel, live at https://brisbane-chi.vercel.app/, auto-deploys on push to `main`
**Dev server:** `npm run dev`

**Stack:** Next.js 16 (App Router, Turbopack) + TypeScript + Tailwind CSS v4 | Supabase (Postgres + Storage + Realtime) | Mapbox GL JS | dnd-kit | Vercel

Next.js 16 has real breaking changes from earlier versions — `middleware.ts` is now `proxy.ts` (exported function named `proxy`), route props are typed via the generated `PageProps<'/route'>`/`LayoutProps<'/route'>` helpers (no manual `params`/`searchParams` typing), and there's a new `next/root-params` module for root-level dynamic segments (unused here — this app has no dynamic root segments). If something looks off vs. older Next.js knowledge, check `node_modules/next/dist/docs/` before assuming.

## Auth — deliberately simple

No Supabase Auth, no per-user accounts, no password at all (there was briefly a shared `TRIP_PASSWORD` gate — removed 2026-09-23 at Rocky's request; the route/page still exist but only check which name was tapped). `/login` (`src/app/login/page.tsx` — a plain HTML form, no client JS needed) is just "Rocky" or "Vince" buttons; picking one is the whole login. The choice is signed into an HMAC cookie (`src/lib/auth/session.ts`, secret is `SESSION_SECRET`) and read via `getSession()`/`useCurrentUser()` (`src/components/CurrentUserContext.tsx`) everywhere identity is needed — the cookie is what prevents casually reassigning who a star/comment/expense belongs to, not a barrier to entering the app at all. There's no access control left on this app beyond "know the URL" — acceptable for a private trip planner two friends use, but don't reuse this pattern for anything more sensitive.

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

One public Supabase Storage bucket, `trip-files` (created by `schema.sql`). Public, with object paths as random UUIDs and no password gate at all in front of the app now — simplest option for a two-person private app, not a defensible security boundary if that threat model ever changes. `src/app/api/upload/route.ts` is the only write path (auth-checked, 15MB cap, image/PDF only); `TRIP_FILES_BUCKET` constant lives in `src/lib/supabase/server.ts`.

## Local dev on this machine needs `NODE_TLS_REJECT_UNAUTHORIZED=0`

Rocky's network/machine does TLS interception (confirmed via curl schannel error `CRYPT_E_NO_REVOCATION_CHECK` and Node's `UNABLE_TO_VERIFY_LEAF_SIGNATURE` against `*.supabase.co` and `api.mapbox.com` both) — Node can't verify the intercepted cert chain, so every outbound HTTPS call from `next dev` fails with a generic `TypeError: fetch failed` after a long hang, not a clear TLS error. Same class of issue already noted in the Harrows-dashboard project. **Local dev only**, run as `NODE_TLS_REJECT_UNAUTHORIZED=0 npm run dev` — never set this in code, `next.config.ts`, or anything committed, and it's irrelevant on Vercel (their network doesn't intercept TLS). `curl` needs `-k` for the same reason when testing from this shell.

## PostgREST embed gotcha: to-one vs to-many

`itinerary_items.idea_id` is `unique`, so PostgREST embeds `ideas → itinerary_items` as a **to-one relationship** (a single object or `null`), not an array — even though it reads like a reverse one-to-many embed. `src/lib/data/ideas.ts`'s `toIdeaWithState()` originally assumed an array (`itinerary_items[0] ?? null`) and crashed Home/Planning/Map with `Cannot read properties of null (reading '0')` the moment a real Supabase project was wired in (never caught locally, since without real data every page threw the "Supabase not configured" error first). Confirmed the actual embed shape by querying directly with the service-role key before trusting the fix. If any other table gains a unique FK later, expect the same thing.

## Verified working (2026-09-23, live on Vercel against the real Supabase project + real Mapbox token)

Login, Home, Planning, Actual, Map (layer-toggle UI renders, meaning the token check passes — actual tile rendering needs a real browser, not verified via curl), idea detail, Trip hub, Flights, Accommodation, Budget (balance math confirmed correct against seed data) all render real Supabase data end-to-end at https://brisbane-chi.vercel.app/. Verified via curl with a real session cookie against both a local dev server and the live Vercel deployment, not a browser — so anything client-JS-only (drag-and-drop, the Add Idea sheet, comment editing, file upload) still hasn't been clicked through by a human on an actual phone.

## Brand rebrand (2026-09-24)

Rocky supplied a "Brisbane 2026" poster graphic (navy/gold/teal/coral, tropical-party style) and asked for the app's palette to match, plus a branded loading screen (the poster with a bouncing rugby ball underneath). Every color in the app now traces to `src/app/globals.css`'s tokens (`--foreground` navy `#12263f`, `--accent` gold `#f2b134`, `--rocky` coral `#d9534f`, `--vince` teal `#167d89`) or, for map-specific needs, `src/lib/day-colors.ts` and `StatusBadge.tsx`'s own bg/text pairs (kept separate from the theme tokens since each status badge needs a bg+text pair, more values than the single-hue tokens hold). `MapView.tsx`'s pin/popup colors reference `var(--accent)`/`var(--muted)`/`var(--foreground)` directly (they're plain CSS strings passed to DOM styles, not Tailwind classes, but `var()` still resolves fine since markers are real DOM nodes) rather than duplicating hex — **the dead giveaway that a color was orphaned from the token system was `grep -rn "#[0-9a-fA-F]\{3,6\}"` across `src/`**; re-run that after any future rebrand to catch strays. Two previously-dead CSS custom properties (`--maybe`/`--locked`/`--booked`) existed in `globals.css` but were never actually consumed by `StatusBadge.tsx` (which has always had its own local hex pairs) — removed rather than wired up, since a badge needs 2 values (bg+text) per status and there's only one consumer.

**Loading screen** (`src/components/LoadingScreen.tsx`, wired as `src/app/(app)/loading.tsx` — Next's file convention that wraps every route under `(app)` in a Suspense boundary): the poster (`public/brisbane-poster.png`, via `next/image`, NOT `unoptimized` like every other image in this app — it's a local `public/` asset so Next's built-in optimizer can resize/reformat it without needing `remotePatterns` config) with a rugby ball (`src/components/RugbyBall.tsx`, hand-drawn SVG in brand gold/navy, not a stock icon) hopping left-to-right-and-back underneath on a dashed "track" line. Animation is hand-authored CSS (`@keyframes rugby-travel`/`rugby-bounce` in `globals.css`) — the horizontal ping-pong (`.rugby-travel`, `alternate`) and the vertical bounce+spin (`.rugby-bounce`, continuous) are on separate nested elements since a single `transform` can't cleanly host two independently-timed animations. Respects `prefers-reduced-motion`.

**Bug found and fixed while wiring this up: `src/proxy.ts`'s matcher didn't exclude `public/` static assets.** Every request for `/brisbane-poster.png` (including Next's own internal server-side fetch of it during image optimization) was getting intercepted and 307-redirected to `/login`, so the image optimizer received login-page HTML instead of PNG bytes and failed with `400 the requested resource isn't a valid image`. Fixed by broadening the matcher's negative lookahead to exclude any path containing a dot (`.*\..*`), not just the specific `favicon.ico`/`icons`/`manifest.json` it had hardcoded — this also means any future `public/` asset (new icons, images, fonts) is automatically exempt without needing another matcher edit. Caught by actually driving the app with Playwright (temporary local install, browser binaries were already cached at `%LOCALAPPDATA%\ms-playwright` from a prior session) rather than trusting curl/build output alone — curl against `/brisbane-poster.png` directly would have shown the 307 redirect immediately if checked, but the bug was only actually *seen* by screenshotting a real rendered page.

## Bug: Zod's `.uuid()` rejects the seed data's ids (2026-09-24)

First real interaction Rocky did after the rebrand — adding an idea — threw a production React error #441 ("an error occurred in the Server Components render," minified/sanitized on the client). Reproduced locally in dev mode (where errors aren't minified) via Playwright driving the real Add Idea flow, which surfaced the real error immediately: `createIdea`'s Zod schema does `trip_id: z.string().uuid()`, and Zod validates the RFC 4122 version nibble strictly — but `seed.sql`'s hand-authored ids (`00000000-0000-0000-0000-000000000001`, version nibble `0`) aren't RFC 4122-compliant, even though Postgres's `uuid` column type and PostgREST accept them fine (Postgres doesn't care about version/variant bits, it just wants 32 hex digits in the right groups). Every "create" action taking a `trip_id` had this same schema (`ideas.ts`, `flights.ts`, `boarding-passes.ts` — also `flight_id`, `accommodation.ts`, `expenses.ts`) — meaning creating *anything* was broken from day one, not just ideas; nobody had tried before Rocky just now.

Fixed with `src/lib/validation.ts`'s `uuidLike` (a plain hex-shaped regex, no version/variant enforcement) used everywhere a `.uuid()` check used to be. **If a future schema needs an id check, use `uuidLike`, never `z.string().uuid()`** — this codebase's ids won't all pass Zod's stricter check.

**Verifying the loading.tsx fallback itself is genuinely hard to catch on a warm dev server** — once a route's chunks are compiled and Supabase queries are warm, `/planning` round-trips in ~130ms, far faster than any external tool (Playwright click → screenshot) can reliably land a frame during. Client-side network-layer delays (`context.route(...).continue()` after a timeout) don't work either, because the delay happens *before* the request reaches the server, so nothing streams to paint during that window at all. The only reliable way to see it on demand: add a temporary `await new Promise(r => setTimeout(r, 3000))` at the top of the page component being tested, screenshot, then revert — confirmed this way, not left in the codebase.
