/**
 * API client — talks to the EventOps backend (api/).
 *
 * Same signatures the UI already used when this was a mock, so no component
 * changed. Base URL from VITE_API_URL, default http://localhost:8080.
 */
import type { EventSummary, EventWorkspaceData } from "@/domain/types";

const BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:8080";

async function getJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${path}`);
  return res.json() as Promise<T>;
}

export async function listEvents(): Promise<EventSummary[]> {
  return getJSON<EventSummary[]>("/api/events");
}

export async function getEvent(id: string): Promise<EventSummary | undefined> {
  const res = await fetch(`${BASE}/api/events/${id}`);
  if (res.status === 404) return undefined;
  if (!res.ok) throw new Error(`${res.status} for /api/events/${id}`);
  return res.json();
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
  const res = await fetch(`${BASE}/api/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`${res.status} creating event`);
  return res.json();
}

export async function getWorkspace(id: string): Promise<EventWorkspaceData> {
  return getJSON<EventWorkspaceData>(`/api/events/${id}/workspace`);
}

// --- Write-back (mutations) --------------------------------------------------

async function send(path: string, method: string, body: unknown): Promise<unknown> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${res.status} ${method} ${path}`);
  return res.json();
}

export const putScore = (eventId: string, teamId: string, challengeKey: string, points: number) =>
  send(`/api/events/${eventId}/scores`, "PUT", { teamId, challengeKey, points });

export const putAdjustments = (eventId: string, teamId: string, bonus: number, penalty: number) =>
  send(`/api/events/${eventId}/teams/${teamId}/adjustments`, "PUT", { bonus, penalty });

export const patchPacking = (itemId: string, done: boolean) =>
  send(`/api/packing/${itemId}`, "PATCH", { done });

export const patchProcurement = (itemId: string, status: string) =>
  send(`/api/procurement/${itemId}`, "PATCH", { status });

export const patchFlow = (blockId: string, completed: boolean) =>
  send(`/api/flow/${blockId}`, "PATCH", { completed });

export const putStationMapping = (stationId: string, producer: string | null, facilitators: string[]) =>
  send(`/api/stations/${stationId}/mapping`, "PUT", { producer, facilitators });

export const generateRotation = (eventId: string) =>
  send(`/api/events/${eventId}/rotation/generate`, "POST", {});

