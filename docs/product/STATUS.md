# Project Status

## Current Phase
Phase 2 / Task 5 completed

## Last Completed
- Phase 2 / Task 5 completed
- Server-side Strava token refresh helper/service implemented
- Stored Strava connections now persist the newest encrypted refresh/access token state after refresh
- First authenticated Strava read path added through a minimal probe endpoint
- Accepted Strava scopes are now normalized, validated, persisted, and checked before reads
- Strava status endpoint now reports activity-read readiness without exposing sensitive internals
- Task 5 security review completed
- Probe endpoint hardened to reduce data exposure

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
- seed/demo owner_id is `local-default`
- do not create a placeholder `strava_connections` seed row yet
- health endpoint stays lightweight for now

## Application Safety Rules
- Never accept owner_id from the client for child records
- Resolve owner_id server-side from the parent row
- Scope updates by both id and owner_id
- Use transactions for multi-step ingest flows
- For webhook flows, resolve owner only from Strava connection or athlete mapping
- Strava auth must fail closed if `STRAVA_ENCRYPTION_KEY` is missing
- Health and status routes must not expose secrets, athlete ids, token presence, or raw env values

## Next Exact Step
Execute Phase 2 / Task 6:
- implement Strava webhook verification and event persistence
- add owner-scoped incremental activity refresh for new or updated Strava activities
- keep full sync expansion and streams out of scope unless explicitly requested

## Open Questions
- confirm whether Task 6 should directly upsert activities from webhook-triggered refreshes or persist-and-process in a separate background step
- confirm whether incremental sync should still exclude activity streams in the Task 6 slice

## Blockers
- none
