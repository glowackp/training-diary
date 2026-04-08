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

### Changed
- README now reflects the runnable local-first project skeleton.
- README now reflects the Phase 1 database baseline and migration state.

### Fixed
- N/A

### Security
- N/A
