/**
 * EventOps OS — domain model.
 * Mirrors the schema in the Technical Design doc. These types are the contract
 * the mock API (and later the real HTTP API) returns.
 */

export type ID = string;

export type EventStatus = "Draft" | "Planning" | "Ready" | "Live" | "Complete";
export type CrewStatus = "Confirmed" | "Pending" | "Unfilled";
export type CrewType = "Full-time" | "Part-time";
export type ProcurementStatus = "To Order" | "Ordered (In Transit)" | "Received on Site";
export type Urgency = "HIGH" | "MEDIUM" | "LOW";
export type DeliverableKind = "Docs" | "Sheets" | "Slides" | "Calendar";
export type GenerationState = "idle" | "working" | "done" | "failed";

export interface EventSummary {
  id: ID;
  name: string;
  client: string;
  venue: string;
  city: string;
  start: string; // ISO date
  end: string; // ISO date
  status: EventStatus;
  pax: number;
  teams: number;
  readiness: number; // 0-100
}

export interface EventDetail extends EventSummary {
  codename: string;
  zone: string;
  time: string; // operating window, e.g. "09:00 – 16:00"
  tz: string;
  producer: string;
  producerRole: string;
  driveFolderId?: string;
}

export interface Team {
  id: ID;
  name: string;
  color: string;
  order: number;
}

export interface Challenge {
  key: string;
  label: string;
  max: number;
  order: number;
}

/** Score cells + per-team adjustments, keyed by team id. */
export interface TeamScore {
  teamId: ID;
  points: Record<string, number>; // challenge key -> points
  bonus: number;
  penalty: number;
}

export interface Station {
  id: ID;
  name: string;
  challengeKey: string;
  room: string;
  producer: string; // "—" when unassigned
  facilitators: string[];
}

export interface FlowDuty {
  role: string;
  who?: string; // producers
  stations?: string; // facilitators label
  crew?: string[]; // facilitators
  duties: string[];
}

export interface FlowBlock {
  id: number;
  blockId: string; // DB id, for write-back
  start: string;
  end: string;
  durationMin: number;
  phase: string;
  title: string;
  description: string;
  producers: FlowDuty[];
  facilitators: FlowDuty[];
  gear: string[];
  completed: boolean;
}

export interface CrewMember {
  name: string; // "—" when the role is unfilled
  role: string;
  type: CrewType;
  rate: string;
  status: CrewStatus;
  rating: number | null;
}

export interface ProcurementItem {
  id: ID;
  item: string;
  category: string;
  qty: number;
  vendor: string;
  urgency: Urgency;
  cost: number; // USD
  status: ProcurementStatus;
}

export interface PackingGroup {
  category: string;
  items: { id: string; name: string; done: boolean }[];
}

export interface DeckSlide {
  title: string;
  state: GenerationState;
}

export interface RotationPosition {
  name: string;
  room: string;
  rest: boolean;
}

/** Everything the event workspace renders, loaded in one call for the prototype. */
export interface EventWorkspaceData {
  event: EventDetail;
  teams: Team[];
  challenges: Challenge[];
  scores: TeamScore[];
  stations: Station[];
  flow: FlowBlock[];
  crew: CrewMember[];
  procurement: ProcurementItem[];
  packing: PackingGroup[];
  deck: string[]; // slide titles
  budgetAllocUsd: number;
  roundSeconds: number;
  rounds: number;
}

export const PRODUCERS = ["Rachel Gomez", "David Ooi", "Marcus Tan", "Siti Zubaidah", "Preethi Raj"];
export const FACILITATOR_POOL = [
  "Aiman Yusof",
  "Jia Hui Low",
  "Ravi Chandran",
  "Nurul Huda",
  "Wei Jie Ng",
  "Chloe Lim",
  "Farhan Idris",
  "Daniel Koh",
  "Hafiz Rosli",
  "Mei Xin Teo",
];
export const PROCUREMENT_STATUSES: ProcurementStatus[] = [
  "To Order",
  "Ordered (In Transit)",
  "Received on Site",
];
