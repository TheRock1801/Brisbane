# Brisbane Weekend Planner

Private trip planner for Rocky and Vince's Brisbane Labour Weekend trip (23–26 Oct 2026).

## Setup

1. `npm install`
2. Copy `.env.local.example` → `.env.local` (already done in dev; fill in the blanks):
   - Supabase project URL/anon key/service role key (Project Settings → API)
   - A Mapbox public token (account.mapbox.com/access-tokens)
   - `TRIP_PASSWORD` — whatever password should gate the app
   - `SESSION_SECRET` — random string (`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
3. In the Supabase SQL editor, run `supabase/schema.sql` then `supabase/seed.sql` (once each — see comments in those files; this project has no migration runner, so any future schema change also gets pasted in manually).
4. `npm run dev` → http://localhost:3000

## Deploying

Push to `main` on `https://github.com/TheRock1801/Brisbane.git` and import the repo into Vercel. Set the same env vars from `.env.local` in the Vercel project settings (Production + Preview).

See `CLAUDE.md` for the full architecture writeup.
