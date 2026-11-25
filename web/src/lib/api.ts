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
