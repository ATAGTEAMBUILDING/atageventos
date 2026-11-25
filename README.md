# EventOps OS

Internal event-operations platform for ATAG (Malaysia) — planning, crew, live tournament scoring,
procurement, packing, and Google Workspace deliverables, for experiential / tournament-style events.

This repository implements the design in **EventOps OS — Technical Design**
(https://claude.ai/artifact/8W4VJdcjN7Tu5Uw6CsMuQs).

## Layout

```
eventops-os/
  web/   React + TypeScript + Tailwind (Vite) front end — runnable now on mock data
  api/   Node + TypeScript (Express) back-end skeleton + Prisma schema (Postgres)
```

The front end runs today against an in-memory **mock API** (`web/src/lib/api.ts`). That module is the
single seam where the real HTTP client swaps in once the `api/` service is built — no UI component calls
the network directly.

## Status

| Area | State |
| --- | --- |
| Web — app shell, dashboard, create wizard, event workspace (9 tabs) | Built, runs on mock data |
| Domain model (TypeScript types) | Defined in `web/src/domain` |
| API — routes, Prisma schema, Google service stubs | Scaffolded; not yet implemented |
| Google Workspace generation + ownership model | **Blocked on the Phase 0 spike** (see design doc) |
| Auth (Google Workspace OAuth), offline PWA | Not started |

## Run the web app

```bash
cd web
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build
```

## Open decisions (from the design doc, before backend work)

1. Is the master Drive on **Google Workspace** (needed for Shared Drives)?
2. File ownership: Shared Drive (recommended) vs. per-user.
3. Generation mechanism: Google APIs vs. Apps Script fallback for Slides.

These gate `api/src/services/google`, not the front end.
