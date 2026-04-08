# Project Status

## Current Phase
Phase 1 / Task 1 completed

## Last Completed
- Phase 0 / Task 0 completed
- Phase 1 / Task 1 completed
- Initial database schema and migrations added
- Security review completed
- Dedupe/idempotency integrity tightened for source-linked records
- token_encryption_key_version added for Strava token rotation safety

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

## Application Safety Rules
- Never accept owner_id from the client for child records
- Resolve owner_id server-side from the parent row
- Scope updates by both id and owner_id
- Use transactions for multi-step ingest flows
- For webhook flows, resolve owner only from Strava connection or athlete mapping

## Next Exact Step
Execute Phase 1 / Task 2:
- env validation cleanup
- config layer cleanup
- typed domain models
- DB query layer cleanup
- local storage adapter cleanup
- encode owner-boundary write discipline into repository/service helpers where appropriate

## Open Questions
- none blocking Task 2

## Blockers
- none
