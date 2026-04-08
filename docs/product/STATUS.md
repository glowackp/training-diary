# Project Status

## Current Phase
Phase 2 / Task 6 foundation completed

## Last Completed
- Phase 2 / Task 4 completed
- Phase 2 / Task 5 completed
- Task 5 security review completed
- Probe endpoint hardened to reduce data exposure
- Phase 2 / Task 6 webhook foundation completed
- Strava webhook verification endpoint implemented
- Strava webhook ingestion endpoint implemented
- Webhook events now persist with traceability and owner-safe mapping to active Strava connections
- Pending webhook events now record future incremental refresh intent without starting activity upserts yet

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
- token handling remains server-side only
- local development must continue to work without Azure

## Application Safety Rules
- Never accept owner_id from the client for child records
- Resolve owner_id server-side from the parent row
- Scope updates by both id and owner_id
- Use transactions for multi-step ingest flows
- For webhook flows, resolve owner only from Strava connection or athlete mapping
- Do not expose secrets or sensitive internals from Strava routes
- Acknowledge unsupported or incomplete webhook deliveries safely without leaking mapping details

## Next Exact Step
Implement the first incremental activity upsert flow on top of pending Strava webhook events:
- read pending webhook events in delivery order
- resolve mapped activity changes into owner-scoped activity upserts
- keep stream ingestion and full sync expansion out of scope for that slice

## Open Questions
- confirm whether the first incremental upsert slice should handle activity deletes as soft removal, visibility change, or a deferred follow-up
- confirm whether athlete deauthorization events should only mark the connection for follow-up or actively revoke the local connection in the same slice

## Blockers
- none
