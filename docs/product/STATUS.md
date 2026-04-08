# Project Status

## Current Phase
Phase 1 / Task 1 completed

## Last Completed
- Phase 0 / Task 0 completed
- Phase 1 / Task 1 completed
- Initial database schema and migrations added
- Drizzle schema modules created for activities, Strava connections, imports, streams, webhook events, comments, and daily stats
- Initial migration generated
- Follow-up migrations generated for comment uniqueness and schema integrity checks
- Schema smoke test added
- QA-style schema review completed
- Integration/Security review completed
- README and CHANGELOG updated

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

## Next Exact Step
Proceed to Phase 1 / Task 2.
Use the current schema constraints and dedupe rules as the baseline for the first ingestion flow.

## Open Questions
- Child tables still rely on application code to keep `owner_id` aligned with the parent row. This is acceptable for now, but Task 2 write paths should preserve that boundary explicitly.

## Blockers
- none

## Notes for Resume
When resuming, read:
1. `AGENTS.md`
2. `docs/product/codex-kickoff-pack.md`
3. `docs/product/STATUS.md`
