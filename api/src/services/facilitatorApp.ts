/**
 * Facilitator App integration (stub).
 *
 * Per ADR-003: EventOps reads confirmed assignments and posts open roles over a
 * REST API; a webhook notifies EventOps of status changes. No shared database.
 * Blocked on the Facilitator App's API contract (base URL, auth, data shapes),
 * configured via FACILITATOR_API_BASE / FACILITATOR_API_KEY.
 */
export interface ConfirmedCrew {
  crewMemberId: string;
  name: string;
  role: string;
  type: "Full-time" | "Part-time";
  rate: string;
  status: "Confirmed" | "Pending" | "Unfilled";
  rating: number | null;
}

export async function listConfirmedCrew(eventId: string): Promise<ConfirmedCrew[]> {
  void eventId;
  throw new Error("Not implemented: read confirmed crew from Facilitator App (ADR-003)");
}

export async function postOpenRole(role: unknown): Promise<{ ok: true; externalId: string }> {
  void role;
  throw new Error("Not implemented: post open role to Facilitator App (ADR-003)");
}

export async function nudgeCrew(assignmentId: string): Promise<{ ok: true }> {
  void assignmentId;
  throw new Error("Not implemented: nudge crew via Facilitator App (ADR-003)");
}
