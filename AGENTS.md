# AGENTS.md

This repository is a personal training diary web app.

## Stack
- Next.js 15
- TypeScript
- Tailwind CSS
- PostgreSQL
- Drizzle ORM
- Zod
- MapLibre GL JS
- Vitest
- Playwright

## Product scope
- activity feed
- activity detail page
- route map for outdoor activities
- personal comments
- weekly / monthly / yearly stats
- calendar view
- Strava sync
- manual upload support for FIT, TCX, GPX

## Data ingestion
- Primary source: Strava
- Fallback source: manual upload
- Supported formats, in order of preference: FIT, TCX, GPX

## Architecture rules
- local development must work without Azure infrastructure
- use adapters/interfaces for cloud-specific behavior
- use local file storage in development
- keep app logic cloud-aware but not cloud-coupled
- Azure infrastructure comes later; do not make Azure required for local runtime

## Security rules
- do not expose secrets or tokens to the client
- all Strava OAuth exchange and token refresh must happen server-side only
- do not store refresh tokens in localStorage
- do not invent unsupported Strava endpoints or scopes
- avoid logging secrets, tokens, or raw credentials
- validate all external input

## Code quality and comments
- write code that is readable first; do not use comments to excuse unclear code
- comment all non-trivial logic, integrations, transformations, background jobs, and security-sensitive code
- public functions, exported helpers, route handlers, and parser modules should have short explanatory comments
- complex conditionals, mapping rules, and deduplication logic must be commented
- trivial lines do not need comments; avoid noisy comments that repeat the code literally
- when changing an existing file, preserve and improve useful comments instead of deleting them casually

## Versioning and change history
- the app must expose a visible application version, sourced from a single canonical place
- keep the current version in the app and in repository documentation
- maintain `README.md` with the current project state, current version, setup instructions, and latest notable changes
- maintain `CHANGELOG.md` as the full history of changes; do not overload the README with the full historical log
- every merge or push to `main` that changes behavior must update version metadata and the changelog
- when a release is not warranted, at minimum update the changelog entry under the current unreleased version
- version changes must be reflected consistently in app UI/version display, docs, and release history

## Pull request discipline
- every pull request must include a clear description of what changed, why, how it was tested, and any follow-up work
- use a pull request template stored under `.github/pull_request_template.md`
- if a schema, env var, command, API contract, or user-visible behavior changes, the PR description must call it out explicitly
- if a PR changes behavior, it must also update README and/or CHANGELOG as appropriate

## Working style
- keep changes small and reviewable
- do not refactor unrelated files
- preserve the agreed repo structure unless the task explicitly requires change
- add or update tests for non-trivial logic
- before finishing, run lint, typecheck, and relevant tests
- if schema, contracts, commands, env vars, versioning, or behavior change, update docs

## Local development defaults
- WSL on Windows is the expected local environment
- Docker Compose is used for local PostgreSQL
- use `.env.local` for local configuration
- keep project files in the WSL filesystem, not under `/mnt/c/...`

## Agent roles
### Builder
- implements features end to end
- writes or updates schema, routes, components, docs, and tests as needed
- keeps implementations minimal, typed, documented, and modular
- updates README, CHANGELOG, and version metadata when behavior changes

### Test/QA
- improves or adds tests
- validates behavior, edge cases, and regressions
- focuses on high-signal tests and realistic fixtures
- checks that versioning/docs updates were not skipped for meaningful changes

### Integration/Security reviewer
- reviews auth, tokens, secrets, webhook handling, idempotency, logging, and failure modes
- suggests the smallest safe correction when a risk is found
- checks that comments exist around critical flows and security-sensitive logic

## Required repository files
The repository should contain and maintain:
- `README.md`
- `CHANGELOG.md`
- `.github/pull_request_template.md`
- a single canonical app version source, referenced by the UI and docs

## Sequencing
For project sequencing and task order, use:
- `docs/product/codex-kickoff-pack.md`

Do not execute the whole backlog automatically.
Only execute the phase or task explicitly requested in the prompt.

## Standard prompt behavior
When asked to work on a task:
1. Read this `AGENTS.md` first.
2. Read `docs/product/codex-kickoff-pack.md` if the task relates to implementation order or architecture.
3. Execute only the requested task or phase.
4. Keep the result scoped.
5. Report what changed, what was validated, and any remaining gap.
