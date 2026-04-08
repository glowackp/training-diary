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

### Changed
- README now reflects the runnable local-first project skeleton.
- README now reflects the Phase 1 database baseline and migration state.
- Health and Strava status placeholders now read from the normalized server config layer.
- Local upload storage now returns owner-scoped relative storage keys instead of machine-specific absolute paths.
- Local development docs now cover migrations, seeding, health verification, and the manual bootstrap path.

### Fixed
- Tightened Strava credential validation so partial OAuth config is rejected before runtime use.
- Local bootstrap guidance now includes a reliable migrate-and-seed path without introducing a fake Strava connection.

### Security
- Repository helpers now encode owner-scoped filters so future child-record reads and writes are harder to implement incorrectly.
