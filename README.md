# Training Diary

Current version: `0.1.0-dev`

The canonical app version is stored in `package.json` and displayed in the app shell.

## Current status
Phase 1 / Task 3 is complete. The app now has validated server config, a typed
repository foundation for owner-scoped data access, local demo seeding for the
locked `local-default` owner, and a clearer local bootstrap workflow that keeps
Azure optional.

## What the app does
- recent training feed
- activity detail pages
- route maps for outdoor activities
- personal comments
- weekly / monthly / yearly stats
- calendar view
- Strava sync
- manual upload support for FIT, TCX, GPX

## Local setup
See `docs/local-development.md`.

The local runtime does not require Azure. Development uses:
- Next.js with the `src/` app router layout
- PostgreSQL via Docker Compose
- local filesystem storage for uploads
- server-only Strava placeholder routes

## Key commands
- `npm install`
- `npm run dev`
- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run test:e2e`
- `npm run db:generate`
- `npm run db:migrate`
- `npm run db:seed`
- `npm run db:setup`

## Environment overview
- `DATABASE_URL`
- `APP_BASE_URL`
- `STORAGE_DRIVER`
- `LOCAL_UPLOAD_DIR`
- `STRAVA_CLIENT_ID`
- `STRAVA_CLIENT_SECRET`
- `STRAVA_WEBHOOK_VERIFY_TOKEN`
- `STRAVA_ENCRYPTION_KEY`

`STRAVA_CLIENT_ID` and `STRAVA_CLIENT_SECRET` are validated as a pair. Local
development continues to default to `STORAGE_DRIVER=local` with filesystem
storage under `LOCAL_UPLOAD_DIR`. Local bootstrap uses the fixed demo owner
`local-default` and does not create a placeholder Strava connection row.

## Latest notable changes
- Added the initial Next.js 15 project skeleton under `src/`.
- Added placeholder pages for dashboard, calendar, activity detail, and settings.
- Added placeholder API routes for health, Strava, uploads, activities, and stats.
- Added local development scaffolding for Docker Compose PostgreSQL, Drizzle, Vitest, and Playwright.
- Added the initial PostgreSQL schema and generated Drizzle migration for ingestion, comments, streams, daily stats, and Strava webhook persistence.
- Added validated server config parsing and normalized runtime config helpers.
- Added owner-scoped repository helpers and typed activity domain mapping for the query layer.
- Updated local upload storage to persist owner-scoped relative storage keys while keeping Azure behind an interface.
- Added a local seed script plus `db:setup` workflow to bootstrap feed/detail/stats demo data for owner `local-default`.
- Expanded local development docs and lightweight health output to make local setup clearer without turning health into a mandatory DB ping.

## Full change history
See `CHANGELOG.md`.
