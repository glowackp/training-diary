# Training Diary

Current version: `0.1.0-dev`

## Current status
Bootstrap / planning stage.

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

## Key commands
- `npm install`
- `npm run dev`
- `npm run test`
- `npm run test:e2e`
- `npm run db:generate`
- `npm run db:migrate`

## Environment overview
- `DATABASE_URL`
- `APP_BASE_URL`
- `APP_VERSION`
- `STORAGE_DRIVER`
- `LOCAL_UPLOAD_DIR`
- `STRAVA_CLIENT_ID`
- `STRAVA_CLIENT_SECRET`
- `STRAVA_WEBHOOK_VERIFY_TOKEN`
- `STRAVA_ENCRYPTION_KEY`

## Latest notable changes
- Initial planning and repository governance established.
- Azure first deployment direction selected for later infrastructure work.
- Strava chosen as primary ingestion source.

## Full change history
See `CHANGELOG.md`.
