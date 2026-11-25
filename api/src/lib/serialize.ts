/**
 * Serializers: Prisma rows -> the web app's domain shapes
 * (web/src/domain/types.ts). This is the mapping layer so the front end's
 * types are unchanged when it swaps its mock api for HTTP.
 */
import type {
  Event, Team, Challenge, Score, Station, FlowBlock, FlowDuty,
  CrewAssignment, CrewMember, ProcurementItem, PackingItem, RotationPlan,
} from "@prisma/client";

const iso = (d: Date) => d.toISOString().slice(0, 10);
const crewType = (t: string) => (t === "FullTime" ? "Full-time" : "Part-time");
const procStatus = (s: string) =>
  s === "ToOrder" ? "To Order" : s === "Ordered" ? "Ordered (In Transit)" : "Received on Site";
const minutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

export const DECK_TITLES = [
  "Title — The Island Escape Expedition", "Welcome & Marooned Narrative", "Safety Brief & Ground Rules",
  "Agenda / Run-of-Show", "Meet Your 6 Teams", "Station 1 — Cryptex Decoding", "Station 2 — Radio Transmission",
  "Station 3 — Toxic Waste Crane", "Station 4 — Raft Construction", "Station 5 — Final Island Portal Unlock",
  "Live Leaderboard", "Awards & Thank You",
];

export function toEventSummary(e: Event) {
  return {
    id: e.id,
    name: e.name,
    client: e.client,
    venue: e.venue,
    city: e.city,
    start: iso(e.date),
    end: iso(e.endDate ?? e.date),
    status: e.status,
    pax: e.pax,
    teams: e.teamsPlanned,
    readiness: e.readiness,
  };
}

type Assignment = CrewAssignment & { crewMember: CrewMember | null };
export type FullEvent = Event & {
  teams: (Team & { scores: Score[] })[];
  challenges: Challenge[];
  stations: (Station & { crewAssignments: Assignment[] })[];
  flowBlocks: (FlowBlock & { duties: FlowDuty[] })[];
  crewAssignments: Assignment[];
  procurement: ProcurementItem[];
  packing: PackingItem[];
  rotationPlan: RotationPlan | null;
};

export function toWorkspace(e: FullEvent) {
  const keyById = new Map(e.challenges.map((c) => [c.id, c.key]));

  const packingGroups: { category: string; items: { id: string; name: string; done: boolean }[] }[] = [];
  for (const p of e.packing) {
    let g = packingGroups.find((x) => x.category === p.category);
    if (!g) {
      g = { category: p.category, items: [] };
      packingGroups.push(g);
    }
    g.items.push({ id: p.id, name: p.name, done: p.done });
  }

  return {
    event: {
      ...toEventSummary(e),
      codename: e.codename ?? "",
      zone: e.zone ?? "",
      time: e.timeWindow ?? "",
      tz: e.timezone,
      producer: "Rachel Gomez",
      producerRole: "Operations Control",
      driveFolderId: e.driveFolderId ?? undefined,
    },
    teams: e.teams.map((t) => ({ id: t.id, name: t.name, color: t.color, order: t.order })),
    challenges: e.challenges.map((c) => ({ key: c.key, label: c.label, max: c.maxPoints, order: c.order })),
    scores: e.teams.map((t) => ({
      teamId: t.id,
      points: Object.fromEntries(t.scores.map((s) => [keyById.get(s.challengeId) ?? s.challengeId, s.points])),
      bonus: t.bonusPoints,
      penalty: t.penaltyPoints,
    })),
    stations: e.stations.map((s) => ({
      id: s.id,
      name: s.name,
      challengeKey: s.challengeId ? keyById.get(s.challengeId) ?? "" : "",
      room: s.room ?? "",
      producer: s.crewAssignments.find((a) => a.roleTitle.includes("Producer"))?.crewMember?.name ?? "—",
      facilitators: s.crewAssignments
        .filter((a) => a.roleTitle.includes("Facilitator"))
        .map((a) => a.crewMember?.name)
        .filter((n): n is string => !!n),
    })),
    flow: e.flowBlocks.map((b) => ({
      id: b.order + 1,
      blockId: b.id,
      start: b.start,
      end: b.end,
      durationMin: minutes(b.end) - minutes(b.start),
      phase: b.phase,
      title: b.title,
      description: b.description ?? "",
      producers: b.duties
        .filter((d) => d.kind === "producer")
        .map((d) => ({ role: d.roleTitle, who: d.crew[0] ?? "", duties: d.duties })),
      facilitators: b.duties
        .filter((d) => d.kind === "facilitator")
        .map((d) => ({ role: d.roleTitle, stations: d.stationsLabel ?? "", crew: d.crew, duties: d.duties })),
      gear: b.gear,
      completed: b.completed,
    })),
    crew: e.crewAssignments
      .filter((a) => a.source === "app" && a.stationId === null)
      .map((a) => ({
        name: a.crewMember?.name ?? "—",
        role: a.roleTitle,
        type: crewType(a.type),
        rate: a.rate ?? "",
        status: a.status,
        rating: a.crewMember?.rating ?? null,
      })),
    procurement: e.procurement.map((p) => ({
      id: p.id,
      item: p.item,
      category: p.category,
      qty: p.qty,
      vendor: p.vendor ?? "",
      urgency: p.urgency,
      cost: Number(p.cost),
      status: procStatus(p.status),
    })),
    packing: packingGroups,
    deck: DECK_TITLES,
    budgetAllocUsd: e.budgetAllocUsd,
    roundSeconds: (e.rotationPlan?.roundMinutes ?? 24) * 60,
    rounds: e.rotationPlan?.rounds ?? 6,
  };
}
