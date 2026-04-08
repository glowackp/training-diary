# Training Diary

Current version: `0.1.0-dev`

The canonical app version is stored in `package.json` and displayed in the app shell.

## Current status
Phase 1 database groundwork complete. The app now has a local-first Next.js
foundation, placeholder routes and API surfaces, and an initial Drizzle schema
plus migration set for activities, Strava connections, imports, streams,
comments, daily stats, and webhook event processing.

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

## Environment overview
- `DATABASE_URL`
- `APP_BASE_URL`
- `STORAGE_DRIVER`
- `LOCAL_UPLOAD_DIR`
- `STRAVA_CLIENT_ID`
- `STRAVA_CLIENT_SECRET`
- `STRAVA_WEBHOOK_VERIFY_TOKEN`
- `STRAVA_ENCRYPTION_KEY`

## Latest notable changes
- Added the initial Next.js 15 project skeleton under `src/`.
- Added placeholder pages for dashboard, calendar, activity detail, and settings.
- Added placeholder API routes for health, Strava, uploads, activities, and stats.
- Added local development scaffolding for Docker Compose PostgreSQL, Drizzle, Vitest, and Playwright.
- Added the initial PostgreSQL schema and generated Drizzle migration for ingestion, comments, streams, daily stats, and Strava webhook persistence.

## Full change history
See `CHANGELOG.md`.
