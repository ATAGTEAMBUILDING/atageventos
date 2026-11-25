/**
 * Mock API layer — the single seam between the UI and data.
 *
 * Every component loads data through these functions, never through `fetch`
 * directly. When the real back-end (api/) is ready, swap these bodies for HTTP
 * calls and the UI is unchanged. Signatures intentionally look like a network
 * client (async, by id).
 */
import type { EventSummary, EventWorkspaceData, EventStatus } from "@/domain/types";
import { DASHBOARD_EVENTS, WORKSPACE_SEED } from "@/domain/seed";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// In-memory store (resets on reload — stands in for the database).
let events: EventSummary[] = [...DASHBOARD_EVENTS];

export async function listEvents(): Promise<EventSummary[]> {
  await delay(120);
  return [...events];
}

export async function getEvent(id: string): Promise<EventSummary | undefined> {
  await delay(60);
  return events.find((e) => e.id === id);
}

export interface CreateEventInput {
  name: string;
  client: string;
  codename?: string;
  venue: string;
  city: string;
  date: string;
  pax: number;
  teams: number;
}

export async function createEvent(input: CreateEventInput): Promise<EventSummary> {
  await delay(200);
  const ev: EventSummary = {
    id: "e" + Math.random().toString(36).slice(2, 6),
    name: input.name || "Untitled event",
    client: input.client || "—",
    venue: input.venue || "TBD",
    city: input.city || "—",
    start: input.date,
    end: input.date,
    status: "Draft" as EventStatus,
    pax: input.pax || 0,
    teams: input.teams || 0,
    readiness: 12,
  };
  events = [ev, ...events];
  return ev;
}

/**
 * Loads the full workspace payload for an event. In this prototype every event
 * resolves to the worked "Island Escape Expedition" dataset, with the header
 * overridden by the selected event's summary so navigation stays coherent.
 */
export async function getWorkspace(id: string): Promise<EventWorkspaceData> {
  await delay(160);
  const summary = events.find((e) => e.id === id);
  if (!summary || id === "e1") return WORKSPACE_SEED;
  return {
    ...WORKSPACE_SEED,
    event: {
      ...WORKSPACE_SEED.event,
      id: summary.id,
      name: summary.name,
      client: summary.client,
      venue: summary.venue,
      city: summary.city,
      start: summary.start,
      end: summary.end,
      status: summary.status,
      pax: summary.pax,
      teams: summary.teams,
      readiness: summary.readiness,
    },
  };
}

export const isFeatureEvent = (id: string) => id === "e1";
