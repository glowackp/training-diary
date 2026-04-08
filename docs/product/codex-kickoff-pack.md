# Codex kickoff pack

## 1. Locked decisions

### Product
You are building a personal training diary web app with:
- recent activity feed
- activity detail page
- map for outdoor activities
- minimum metrics per activity: distance, pace/speed, HR, time
- personal comment per activity
- weekly / monthly / yearly stats
- calendar view

### Data ingestion
Two ways to create a new entry:
1. Strava sync — primary source
2. Manual upload — fallback source

### Supported upload formats
In this order:
- FIT — preferred
- TCX — supported
- GPX — supported, lowest fidelity

### App stack
- Next.js 15
- TypeScript
- Tailwind CSS
- PostgreSQL
- Drizzle ORM
- Zod
- MapLibre GL JS
- Vitest
- Playwright

### Cloud direction
- First round: Azure
- Infrastructure later: Terraform
- Same cloud for app + DB in deployed environments

### Azure target architecture
- Azure App Service (Linux)
- Azure Database for PostgreSQL Flexible Server
- Azure Blob Storage
- Azure Key Vault

### Delivery model
- app code first
- infrastructure later
- Terraform for infrastructure
- GitHub Actions later for build, test, and deploy

### Mobile target
- modern mobile browsers
- responsive web app, not native app
- mobile-first layout

### Agent model
Use only these agents for now:
- Builder
- Test/QA
- Integration/Security reviewer

Do not create a dedicated infrastructure agent yet.

### Governance decisions
- all non-trivial code must be commented
- route handlers, exported helpers, parser modules, security-sensitive code, and integration logic must carry clear explanatory comments
- the app must have a visible app version sourced from one canonical place
- `README.md` must describe the current version, current state, setup, and latest notable changes
- `CHANGELOG.md` must hold the full change history
- every meaningful change merged to `main` must update version metadata and changelog entries
- every pull request must contain a clear description of scope, reason, testing, and follow-up items

---

## 2. Build strategy

Build the app so it works locally first, with cloud adapters added later.

That means:
- local PostgreSQL in Docker
- local file storage for uploads
- Strava integration runnable locally
- Azure-specific storage and secrets behind interfaces later

This keeps the app testable before infrastructure exists.

---

## 3. Recommended repo structure

```text
training-diary/
├─ src/
│  ├─ app/
│  │  ├─ (dashboard)/
│  │  │  ├─ page.tsx
│  │  │  ├─ calendar/page.tsx
│  │  │  ├─ activities/[id]/page.tsx
│  │  │  └─ settings/page.tsx
│  │  ├─ api/
│  │  │  ├─ health/route.ts
│  │  │  ├─ strava/
│  │  │  │  ├─ connect/route.ts
│  │  │  │  ├─ callback/route.ts
│  │  │  │  ├─ webhook/route.ts
│  │  │  │  ├─ status/route.ts
│  │  │  │  └─ sync/
│  │  │  │     ├─ full/route.ts
│  │  │  │     ├─ recent/route.ts
│  │  │  │     └─ [sourceActivityId]/route.ts
│  │  │  ├─ uploads/
│  │  │  │  ├─ activity/route.ts
│  │  │  │  └─ [importId]/reprocess/route.ts
│  │  │  ├─ activities/
│  │  │  │  ├─ route.ts
│  │  │  │  └─ [id]/
│  │  │  │     ├─ route.ts
│  │  │  │     └─ comment/route.ts
│  │  │  └─ stats/
│  │  │     ├─ sidebar/route.ts
│  │  │     ├─ calendar/route.ts
│  │  │     └─ trends/route.ts
│  │  ├─ globals.css
│  │  ├─ layout.tsx
│  │  └─ page.tsx
│  ├─ components/
│  │  ├─ activity/
│  │  ├─ dashboard/
│  │  ├─ maps/
│  │  └─ ui/
│  ├─ lib/
│  │  ├─ config/
│  │  ├─ db/
│  │  │  ├─ client.ts
│  │  │  ├─ schema/
│  │  │  └─ queries/
│  │  ├─ strava/
│  │  ├─ uploads/
│  │  ├─ storage/
│  │  │  ├─ index.ts
│  │  │  ├─ local.ts
│  │  │  └─ azure-blob.ts
│  │  ├─ stats/
│  │  ├─ crypto/
│  │  └─ utils/
│  ├─ jobs/
│  ├─ types/
│  └─ tests/
├─ drizzle/
│  ├─ migrations/
│  └─ meta/
├─ docs/
│  ├─ adr/
│  ├─ product/
│  ├─ integrations/
│  └─ local-development.md
├─ infra/
│  └─ terraform/
├─ scripts/
├─ .github/
│  ├─ workflows/
│  └─ pull_request_template.md
├─ docker-compose.yml
├─ .env.example
├─ package.json
├─ tsconfig.json
├─ next.config.ts
├─ README.md
└─ CHANGELOG.md
```

---

## 4. Agent setup

Keep it to 3 agents.

### Shared instruction for all agents
Use the repository root `AGENTS.md` as the primary instruction file.

### Builder
Responsible for:
- feature implementation
- DB schema and migrations
- API handlers
- pages and components
- integration code
- minimum necessary tests
- version metadata, README, and changelog updates when behavior changes

### Test/QA
Responsible for:
- unit, integration, and e2e tests
- fixtures
- regression detection
- parser validation
- edge cases
- checking that docs/version updates were not skipped

### Integration/Security reviewer
Responsible for:
- Strava OAuth correctness
- token handling
- webhook flow
- duplicate prevention
- secret handling
- unsafe logging or config
- review of comments around critical logic

---

## 5. Local test environment on WSL

Target environment:
- Windows with WSL
- Ubuntu in WSL
- VS Code with WSL extension
- Docker Desktop with WSL integration enabled

### Install inside WSL

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl unzip build-essential postgresql-client
```

Install Node 20 with nvm:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
node -v
npm -v
```

### Project location
Keep the repo in the WSL filesystem, for example:

```bash
mkdir -p ~/projects
cd ~/projects
git clone <your-repo-url> training-diary
cd training-diary
code .
```

### Docker Compose for PostgreSQL
Create `docker-compose.yml`:

```yaml
version: "3.9"

services:
  postgres:
    image: postgres:16
    container_name: training-diary-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: training_diary
      POSTGRES_USER: app
      POSTGRES_PASSWORD: app
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

Start DB:

```bash
docker compose up -d
docker compose ps
```

Test DB:

```bash
psql "postgresql://app:app@localhost:5432/training_diary" -c "select version();"
```

### Local environment variables
Suggested `.env.local`:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://app:app@localhost:5432/training_diary
APP_BASE_URL=http://localhost:3000
STORAGE_DRIVER=local
LOCAL_UPLOAD_DIR=./.uploads
STRAVA_CLIENT_ID=
STRAVA_CLIENT_SECRET=
STRAVA_WEBHOOK_VERIFY_TOKEN=change-me
STRAVA_ENCRYPTION_KEY=change-me-32-char-minimum
APP_VERSION=0.1.0-dev
LOG_LEVEL=debug
```

### Local startup flow

```bash
npm install
cp .env.example .env.local
npm run db:generate
npm run db:migrate
npm run dev
```

Run tests:

```bash
npm run test
npm run test:e2e
```

### Local Strava live testing
For real OAuth and webhook testing, expose the local app with a public HTTPS tunnel, for example:
- ngrok
- cloudflared

Example:

```bash
ngrok http 3000
```

Use the generated HTTPS URL for:
- Strava OAuth callback
- Strava webhook callback

### What can be tested locally
You can test locally:
- DB schema and migrations
- API routes
- feed rendering
- activity detail page
- comments
- stats aggregation
- calendar page
- manual uploads
- upload normalization
- duplicate detection
- most Strava logic via fixtures
- real Strava flow with a public tunnel

You do not need Azure infrastructure to start development.

---

## 6. Required repository governance files

### README.md
README must contain at least:
- project name
- current app version
- current project status
- implemented scope
- local setup instructions
- key commands
- environment variable overview
- latest notable changes summary
- pointer to `CHANGELOG.md` for full history

### CHANGELOG.md
Use a simple versioned changelog structure, for example:
- Unreleased
- 0.1.0
- 0.1.1
- 0.2.0

Each entry should note:
- added
- changed
- fixed
- security

### Pull request template
Create `.github/pull_request_template.md` with sections for:
- summary
- why this change
- how tested
- screenshots or notes if UI changed
- schema/env/api changes
- follow-up items
- docs/version/changelog updated checklist

### Version source
Maintain one canonical version source.
Recommended options:
- `package.json` version as canonical source
- optionally mirrored into app UI through env/build-time injection

The visible app version should be shown in the app footer, settings page, or dashboard header.

---

## 7. Codex operating sequence

Use this sequence every time.

### Step 1
Give the task to Builder.

### Step 2
When Builder finishes, send the same branch or worktree to Test/QA.

### Step 3
Then send the same result to Integration/Security reviewer.

### Step 4
Merge only if:
- app runs
- lint and typecheck pass
- tests pass
- no secret or token leakage exists
- docs and versioning are updated when needed
- change is scoped and understandable

### Rule
Do not let two agents edit the same files in parallel.

---

## 8. Kickoff backlog

Put this into `docs/product/backlog.md`.

### Phase 0 — bootstrap
**Task 0**  
Create the initial project skeleton with Next.js 15, TypeScript, Tailwind, Drizzle, Zod, Vitest, Playwright, Docker Compose for local Postgres, docs folder, placeholder pages/routes matching the agreed repo structure, README, CHANGELOG, PR template, and version display scaffold.

### Phase 1 — foundation
**Task 1**  
Implement database schema and migrations for activities, Strava connections, imports, streams, webhook events, comments, and daily stats.

**Task 2**  
Create typed models, DB query layer, env validation, config layer, canonical app version handling, and local storage adapter.

**Task 3**  
Create health endpoint, seed script, and local development docs.

### Phase 2 — Strava
**Task 4**  
Implement Strava connect, callback, encrypted token storage, athlete lock to a single account, and Strava status endpoint.

**Task 5**  
Implement initial full sync from Strava into normalized activity records without streams first.

**Task 6**  
Implement webhook endpoint, event persistence, and incremental sync for new or updated activities.

### Phase 3 — core UI
**Task 7**  
Implement recent activity feed page with filters, metric cards, and visible app version.

**Task 8**  
Implement activity detail page with full stats, comment editor, and full map for outdoor activities.

**Task 9**  
Implement weekly, monthly, and yearly sidebar stats and stats query endpoints.

**Task 10**  
Implement calendar page with day grouping and click-through to activities.

### Phase 4 — manual uploads
**Task 11**  
Implement manual upload endpoint and local storage persistence for FIT, TCX, and GPX files.

**Task 12**  
Implement parser pipeline, normalization, dedupe logic, and activity upsert flow for uploaded files.

### Phase 5 — hardening
**Task 13**  
Add tests and fixtures for Strava mapping, upload parsing, duplicate detection, and stats aggregation.

**Task 14**  
Add e2e coverage for feed view, activity detail, comment update, upload flow, and calendar rendering.

**Task 15**  
Review and harden logging, validation, error handling, comments on critical logic, README, changelog discipline, and token security.

### Phase 6 — infrastructure later
**Task 16**  
Introduce Azure adapters and deployment configuration.

**Task 17**  
Add Terraform modules for Azure infrastructure.

**Task 18**  
Add GitHub Actions for build, test, and deploy.

---

## 9. Exact first prompts to paste into Codex

### Prompt 1 — Builder
```text
Create the initial project skeleton for a personal training diary app using Next.js 15, TypeScript, Tailwind, Drizzle ORM, Zod, Vitest, Playwright, and Docker Compose for local Postgres.

Requirements:
- follow the agreed repo structure
- create placeholder pages for dashboard, calendar, activity detail, and settings
- create placeholder API route files for health, Strava, uploads, activities, and stats
- add docs folder with ADR placeholder, backlog placeholder, and local development placeholder
- add README.md, CHANGELOG.md, and .github/pull_request_template.md
- add canonical app version handling scaffold and visible version placeholder in UI
- local development must work without Azure
- use src/ layout
- comment non-trivial code and exported modules
- keep code minimal but clean

Done when:
- npm install works
- docker compose file exists for Postgres
- app starts locally
- test scaffolding exists
- repo structure matches the agreed architecture
- README and CHANGELOG exist
```

### Prompt 2 — Test/QA
```text
Review the initial project skeleton branch.

Tasks:
- verify app boots
- verify Docker Compose Postgres config is sane
- verify test scaffolding works
- verify README, CHANGELOG, PR template, and app version scaffold exist
- add or fix only what is necessary for a reliable baseline
- report any missing pieces that will block the next database/schema task
```

### Prompt 3 — Integration/Security
```text
Review the initial project skeleton branch for early structural risks.

Focus on:
- env handling
- accidental client exposure of secrets
- bad folder placement for future server-only code
- missing boundaries for storage/adapters
- local development safety
- whether versioning and documentation discipline are scaffolded correctly

Make only minimal corrections if needed.
```

### Prompt 4 — Builder
```text
Implement the initial database schema and migrations for:
- activities
- strava_connections
- activity_imports
- activity_streams
- strava_webhook_events
- activity_comments
- daily_activity_stats

Requirements:
- use Drizzle schema files under src/lib/db/schema
- create migrations
- include indexes and unique constraints needed for dedupe
- include timestamps and user ownership
- keep schema aligned with Strava-first ingestion plus manual upload fallback
- comment non-trivial schema decisions and dedupe rules

Also add:
- db client
- migration scripts
- basic query helpers
```

### Prompt 5 — Builder
```text
Implement local environment support:
- env validation with Zod
- local file storage adapter
- local upload directory handling
- health endpoint that checks app and database
- local development documentation in docs/local-development.md
- README current version section and latest notable changes section

Keep Azure out of runtime requirements for now.
```

---

## 10. Minimal local checklist for the developer

1. Install WSL and Ubuntu.
2. Install Docker Desktop and enable WSL integration.
3. Install Node 20 inside WSL.
4. Clone the repo into `~/projects/...` inside WSL, not under `/mnt/c/...`.
5. Open the repo with `code .` from WSL.
6. Start PostgreSQL with Docker Compose.
7. Run `npm install`.
8. Copy `.env.example` to `.env.local`.
9. Run migrations.
10. Start the app with `npm run dev`.

---

## 11. Best build order

Use this order and do not skip around:
1. bootstrap repo
2. DB and migrations
3. local config and storage adapter
4. Strava auth
5. Strava sync
6. feed
7. activity detail
8. comments
9. stats
10. calendar
11. manual uploads
12. hardening
13. Azure and Terraform

That is the fastest path to visible progress without wrecking the architecture.
