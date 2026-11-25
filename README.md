# EventOps OS

Internal event-operations platform for ATAG (Malaysia) — planning, crew, live tournament scoring,
procurement, packing, and Google Workspace deliverables, for experiential / tournament-style events.

This repository implements the design in **EventOps OS — Technical Design**
(https://claude.ai/artifact/8W4VJdcjN7Tu5Uw6CsMuQs).

## Layout

```
eventops-os/
  web/     React + TypeScript + Tailwind (Vite) front end
  api/     Node + TypeScript (Express) back end + Prisma schema (Postgres)
  spike/   Phase 0 Google Workspace generation spike (throwaway, run against real Drive)
```

The front end talks to the back end through one module, `web/src/lib/api.ts` (HTTP client). No UI
component calls the network directly.

## Status

| Area | State |
| --- | --- |
| Web — app shell, dashboard, create wizard, event workspace (9 tabs) | Built, full-stack |
| API — events / scores / rotation / deliverables / crew routes | Built, serving from Postgres |
| Database — Prisma schema + migrations + seed (Island Escape dataset) | Built |
| Google Workspace generation (Drive / Sheets / Slides) | Code written, **spike-verified**; needs Shared Drive + service account + template ids |
| Auth (Google Workspace OAuth), offline PWA | Not started |

## Run full-stack locally

Needs a PostgreSQL 16 database. Point `api/.env` at it (copy `api/.env.example`):

```bash
# api/.env
DATABASE_URL="postgresql://USER@localhost:5432/eventops?schema=public"
PORT=8080
WEB_ORIGIN="http://localhost:5173"
```

Then:

```bash
# back end
cd api
npm install
npx prisma migrate dev     # create schema
npm run db:seed            # load the Island Escape dataset + dashboard events
npm run dev                # http://localhost:8080

# front end (second terminal)
cd web
npm install
npm run dev                # http://localhost:5173  (set VITE_API_URL if the API isn't on :8080)
```

`npm run build` in either package type-checks and builds for production.

## Phase 0 spike result (25 Nov 2026)

Verified against the real template Drive: Drive provisioning, Sheets write, and Slides duplicate+merge
all work with plain Google REST APIs. Deliverables are **Sheets + Slides** (no Docs); templates have
**no named ranges**; files are currently **personally owned** — create a Shared Drive and use a service
account. Details in the design doc. To run the spike yourself: `cd spike && npm install && node run.mjs`
(see `spike/README.md`).

## Before production Google generation

1. Create a Shared Drive; move `EVENT OPS OS Events` into it (team-owned files).
2. Create a service account, add it to the Shared Drive, base64 its key into `GOOGLE_SERVICE_ACCOUNT_KEY`.
3. Set the template file ids + events folder in `api/.env` (see `api/.env.example`).
