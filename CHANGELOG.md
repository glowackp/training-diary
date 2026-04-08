# Changelog

All notable changes to this project should be documented in this file.

## [Unreleased]
### Added
- Initial Next.js 15 app skeleton using the `src/` layout.
- Placeholder dashboard, calendar, activity detail, and settings pages.
- Placeholder API route files for health, Strava, uploads, activities, and stats.
- Drizzle, Zod, Vitest, Playwright, and Docker Compose project scaffolding.
- Local development and documentation placeholders, including ADR and backlog docs.
- Initial Drizzle schema files and generated migration for `activities`, `strava_connections`, `activity_imports`, `activity_streams`, `strava_webhook_events`, `activity_comments`, and `daily_activity_stats`.
- Minimal database query helpers for source-id dedupe, manual import checksum lookups, Strava connection lookup, and pending webhook processing.
- Validated server env parsing and a normalized runtime config layer for local-first execution.
- Owner-scoped repository helpers and typed activity mapping for the current query layer.
- Unit coverage for env validation defaults and local upload storage behavior.
- Local seed script support and a `db:setup` workflow for owner `local-default`.
- Unit coverage for the local seed plan fixture builder.
- The first Strava auth slice with connect, callback, and status routes plus encrypted token persistence helpers.
- Unit coverage for Strava auth env rules, OAuth state validation, scope checks, and token encryption.
- Server-side Strava token refresh support and a minimal authenticated probe endpoint for the first post-connect read.
- Unit coverage for token refresh request building, early-refresh timing, and the recent-activities probe reader.

### Changed
- README now reflects the runnable local-first project skeleton.
- README now reflects the Phase 1 database baseline and migration state.
- Health and Strava status placeholders now read from the normalized server config layer.
- Local upload storage now returns owner-scoped relative storage keys instead of machine-specific absolute paths.
- Local development docs now cover migrations, seeding, health verification, and the manual bootstrap path.
- README and local-development docs now describe the Strava auth env requirements and local connect flow.
- Strava status now reports activity-read readiness separately from connection state, and the minimal requested scope set is now `activity:read,activity:read_all`.

### Fixed
- Tightened Strava credential validation so partial OAuth config is rejected before runtime use.
- Local bootstrap guidance now includes a reliable migrate-and-seed path without introducing a fake Strava connection.
- Strava auth now fails closed unless `STRAVA_ENCRYPTION_KEY` is configured, and health/status routes no longer expose internal readiness details beyond high-level state.
- The first authenticated Strava read now retries once with a server-side token refresh before surfacing reconnect or upstream failure states.
- The Strava probe route now returns only high-level success/count data instead of recent activity details.

### Security
- Repository helpers now encode owner-scoped filters so future child-record reads and writes are harder to implement incorrectly.
- Strava OAuth state is now signed and bound to an httpOnly cookie, and access/refresh tokens are encrypted before persistence.
- Accepted Strava scopes are normalized and persisted, and probe/status routes avoid exposing secrets, athlete ids, or token values.
