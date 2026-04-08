# Local development

This project is designed to run locally without Azure.

## Prerequisites
- Node.js 20 or newer
- npm
- Docker Desktop with WSL integration enabled

## Setup
1. Copy `.env.example` to `.env.local`.
2. Start PostgreSQL with `docker compose up -d postgres`.
3. Install dependencies with `npm install`.
4. Start the app with `npm run dev`.

## Useful commands
- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run test:e2e`
- `npm run db:generate`
- `npm run db:migrate`

## Notes
- `STORAGE_DRIVER=local` keeps uploads on the local filesystem during development.
- Azure-specific infrastructure is intentionally out of scope for the local runtime.
