# Project Status

## Current Phase
Phase 2 / Task 4 completed

## Last Completed
- Phase 2 / Task 4 completed
- Strava connect endpoint implemented
- Strava callback endpoint implemented with state validation and server-side code exchange
- Strava status endpoint completed with high-level readiness/connection state only
- Encrypted token persistence and athlete lock added for the `local-default` owner flow
- Strava auth env validation tightened so auth fails closed without `STRAVA_ENCRYPTION_KEY`

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
Execute Phase 2 / Task 5:
- add token refresh support on top of the encrypted Strava connection records
- confirm the next scope set needed before starting authenticated athlete or activity reads
- keep webhook flow and activity sync out of scope until the next slice is explicitly requested

## Open Questions
- confirm whether Task 5 should stay limited to token refresh and auth hardening, or begin the first authenticated read from Strava
- confirm whether `activity:read_all` remains the desired minimum scope set or if a broader profile scope is needed next

## Blockers
- none
