# Local development

This project is designed to run locally without Azure.

## Prerequisites
- Node.js 20 or newer
- npm
- PostgreSQL client tools if you want direct DB inspection
- Docker Desktop with WSL integration enabled

## Quick start
1. Copy `.env.example` to `.env.local`.
2. Install dependencies with `npm install`.
3. Start PostgreSQL with `docker compose up -d postgres`.
4. Run `npm run db:setup`.
5. Start the app with `npm run dev`.
6. Open `http://localhost:3000`.
7. Verify lightweight health output at `http://localhost:3000/api/health`.

## What `db:setup` does
- Runs the current Drizzle migrations
- Seeds demo data for owner `local-default`
- Does not create a placeholder `strava_connections` row
- Does not start Strava OAuth or manual upload parsing work

## Manual bootstrap commands
If you prefer explicit steps:

```bash
cp .env.example .env.local
npm install
docker compose up -d postgres
npm run db:migrate
npm run db:seed
npm run dev
```

## Seeded local data
- Demo owner id: `local-default`
- 3 manual-upload activities
- comments for each seeded activity
- route/metric stream examples in `activity_streams`
- daily rollups in `daily_activity_stats`
- no Strava connection seed row

## Useful commands
- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run test:e2e`
- `npm run db:generate`
- `npm run db:migrate`
- `npm run db:seed`
- `npm run db:setup`

## Notes
- `STORAGE_DRIVER=local` keeps uploads on the local filesystem during development.
- `STRAVA_CLIENT_ID`, `STRAVA_CLIENT_SECRET`, and `STRAVA_ENCRYPTION_KEY` can stay empty until Strava auth is needed.
- Once you enable Strava auth locally, all three must be set together and `STRAVA_ENCRYPTION_KEY` must be at least 32 characters long.
- The current minimal Strava scope request is `activity:read,activity:read_all`.
- `APP_BASE_URL` must match the callback domain configured for your Strava application, for example `http://localhost:3000`.
- Azure-specific infrastructure is intentionally out of scope for the local runtime.
- The health endpoint stays lightweight on purpose, is not a required database ping, and does not expose Strava readiness details.

## Local Strava auth setup
1. Register a Strava application and allow the local callback domain.
2. Set `STRAVA_CLIENT_ID`, `STRAVA_CLIENT_SECRET`, and `STRAVA_ENCRYPTION_KEY` in `.env.local`.
3. Keep `owner_id` local-first by using the built-in `local-default` owner flow.
4. Start the app and open `/api/strava/connect` to begin the browser redirect flow.
5. Use `/api/strava/status` to confirm only high-level readiness, connection state, and activity-read readiness.
6. Use `/api/strava/probe` to verify the first authenticated Strava read path without starting sync.
