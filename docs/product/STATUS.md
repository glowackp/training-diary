# Project Status

## Current Phase
Phase 1 / Task 2 completed

## Last Completed
- Phase 0 / Task 0 completed
- Phase 1 / Task 1 completed
- Phase 1 / Task 2 completed
- Initial database schema and migrations added
- Security review completed
- Dedupe/idempotency integrity tightened for source-linked records
- token_encryption_key_version added for Strava token rotation safety
- server env validation and normalized config layer added
- owner-scoped repository helpers and typed activity domain mapping added
- local storage adapter now persists relative owner-scoped upload keys

## Current Branch
- main

## Decisions Locked
- Strava is the primary source of activities
- Manual upload is fallback
- Supported file formats: FIT, TCX, GPX
- Next.js 15 + TypeScript + Tailwind
- PostgreSQL + Drizzle ORM
- MapLibre for maps
- Azure first for test round
- Terraform later
- Local-first development in WSL
- owner_id stays a plain string for now
- one active Strava connection per owner/athlete
- one personal comment per activity
- activity_streams stored as jsonb by (activity_id, stream_type)
- strict dedupe for uploads and source activity ids
- seed owner id locked to local-default
- health endpoint stays lightweight for now

## Application Safety Rules
- Never accept owner_id from the client for child records
- Resolve owner_id server-side from the parent row
- Scope updates by both id and owner_id
- Use transactions for multi-step ingest flows
- For webhook flows, resolve owner only from Strava connection or athlete mapping

## Next Exact Step
Execute Phase 1 / Task 3:
- replace the placeholder health endpoint with a real local readiness check
- add a safe local seed script for demo data and owner-scoped records
- expand local development docs for env setup, DB lifecycle, and verification commands

## Open Questions
- confirm the demo seed owner id and whether seed data should include a placeholder Strava connection row
- confirm whether the health endpoint should remain lightweight or include an actual database ping in local development

## Blockers
- none
