/**
 * Seed the database with the dashboard events and the fully worked
 * "Island Escape Expedition" event (teams, challenges, scores, stations, flow,
 * crew, procurement, packing, rotation plan). Mirrors web/src/domain/seed.ts.
 *
 * Run: npm run db:seed  (configured as prisma.seed in package.json)
 */
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clean slate (dev only).
  await prisma.$transaction([
    prisma.rotationCell.deleteMany(),
    prisma.rotationPlan.deleteMany(),
    prisma.score.deleteMany(),
    prisma.flowDuty.deleteMany(),
    prisma.flowBlock.deleteMany(),
    prisma.crewAssignment.deleteMany(),
    prisma.station.deleteMany(),
    prisma.participant.deleteMany(),
    prisma.challenge.deleteMany(),
    prisma.team.deleteMany(),
    prisma.procurementItem.deleteMany(),
    prisma.packingItem.deleteMany(),
    prisma.deliverable.deleteMany(),
    prisma.readinessItem.deleteMany(),
    prisma.event.deleteMany(),
    prisma.crewMember.deleteMany(),
  ]);

  // --- The four summary events (dashboard only) ---
  const summaries: Prisma.EventCreateManyInput[] = [
    { name: "Maybank Graduate Bootcamp", client: "Maybank Group", venue: "Menara Maybank", city: "Kuala Lumpur", date: new Date("2026-02-03"), status: "Ready", pax: 84, teamsPlanned: 7, readiness: 95 },
    { name: "Shopee Sales Gladiators", client: "Shopee", venue: "Sentosa Island", city: "Singapore", date: new Date("2026-01-29"), status: "Live", pax: 120, teamsPlanned: 10, readiness: 100 },
    { name: "Petronas Leadership Odyssey", client: "Petronas", venue: "TBD", city: "Langkawi", date: new Date("2026-04-05"), endDate: new Date("2026-04-06"), status: "Draft", pax: 0, teamsPlanned: 0, readiness: 18 },
    { name: "AirAsia Culture Carnival", client: "AirAsia", venue: "Sepang Int'l Circuit", city: "Selangor", date: new Date("2025-11-08"), status: "Complete", pax: 200, teamsPlanned: 16, readiness: 100 },
  ];
  await prisma.event.createMany({ data: summaries });

  // --- The featured event ---
  const event = await prisma.event.create({
    data: {
      name: "Grab Engineering Leadership Summit 2026",
      codename: "The Island Escape Expedition",
      client: "Grab Holdings",
      venue: "Bintan Lagoon Adventure Camp, Riau Islands",
      city: "Riau Islands",
      zone: "Jungle Outpost & Coastal Lagoon",
      date: new Date("2026-10-24"),
      timeWindow: "09:00 – 16:00",
      timezone: "Asia/Jakarta (WIB, UTC+7)",
      status: "Planning",
      pax: 90,
      teamsPlanned: 6,
      readiness: 76,
      budgetAllocUsd: 600,
    },
  });
  const eventId = event.id;

  // Challenges
  const challengeData = [
    { key: "cryptex", label: "Cryptex Decoding", maxPoints: 100, order: 0 },
    { key: "radio", label: "Radio Transmission", maxPoints: 100, order: 1 },
    { key: "toxic", label: "Toxic Waste Crane", maxPoints: 100, order: 2 },
    { key: "raft", label: "Raft Construction", maxPoints: 120, order: 3 },
    { key: "portal", label: "Final Island Portal Unlock", maxPoints: 150, order: 4 },
  ];
  const challenges = await Promise.all(
    challengeData.map((c) => prisma.challenge.create({ data: { ...c, eventId } }))
  );
  const chByKey = Object.fromEntries(challenges.map((c) => [c.key, c]));

  // Teams + scores
  const teamData = [
    { name: "The Algorithmic Castaways", color: "#16A34A", order: 0, pts: { cryptex: 100, radio: 90 }, bonus: 0, pen: 0 },
    { name: "Payload Pioneers", color: "#2563EB", order: 1, pts: { cryptex: 95, radio: 85 }, bonus: 0, pen: 0 },
    { name: "Distributed Nomads", color: "#D97706", order: 2, pts: { cryptex: 80, radio: 95 }, bonus: 0, pen: 5 },
    { name: "Bintan Byte-Busters", color: "#7A3DB5", order: 3, pts: { cryptex: 90, radio: 70 }, bonus: 0, pen: 0 },
    { name: "Kubernetes Raft Crew", color: "#0E7C86", order: 4, pts: { cryptex: 75, radio: 80 }, bonus: 0, pen: 0 },
    { name: "Zero Downtime Explorers", color: "#DC2626", order: 5, pts: { cryptex: 70, radio: 75 }, bonus: 0, pen: 0 },
  ];
  for (const t of teamData) {
    const team = await prisma.team.create({
      data: { eventId, name: t.name, color: t.color, order: t.order, bonusPoints: t.bonus, penaltyPoints: t.pen },
    });
    for (const c of challenges) {
      await prisma.score.create({
        data: { eventId, teamId: team.id, challengeId: c.id, points: (t.pts as Record<string, number>)[c.key] ?? 0 },
      });
    }
  }

  // People — one CrewMember per unique person, reused across assignments
  const personDefs = [
    { name: "Rachel Gomez", type: "FullTime", rate: "RM 1,500/day", rating: 4.9 },
    { name: "David Ooi", type: "FullTime", rate: "RM 1,300/day", rating: 4.8 },
    { name: "Marcus Tan", type: "FullTime", rate: "RM 1,200/day", rating: 4.7 },
    { name: "Siti Zubaidah", type: "FullTime", rate: "RM 1,150/day", rating: 4.6 },
    { name: "Aiman Yusof", type: "PartTime", rate: "RM 850/day", rating: 4.5 },
    { name: "Jia Hui Low", type: "PartTime", rate: "RM 850/day", rating: 4.6 },
    { name: "Ravi Chandran", type: "PartTime", rate: "RM 800/day", rating: 4.4 },
    { name: "Nurul Huda", type: "PartTime", rate: "RM 700/day", rating: 4.7 },
    { name: "Wei Jie Ng", type: "PartTime", rate: "RM 800/day", rating: 4.5 },
    { name: "Chloe Lim", type: "PartTime", rate: "RM 800/day", rating: 4.5 },
    { name: "Farhan Idris", type: "PartTime", rate: "RM 800/day", rating: 4.4 },
    { name: "Daniel Koh", type: "PartTime", rate: "RM 800/day", rating: 4.6 },
  ] as const;
  const pid = new Map<string, string>();
  for (const p of personDefs) {
    const m = await prisma.crewMember.create({ data: { name: p.name, type: p.type, defaultRate: p.rate, rating: p.rating } });
    pid.set(p.name, m.id);
  }

  // Stations + their producer / facilitator assignments (feeds Station & Role Mapping)
  const stationData = [
    { name: "Cryptex Decoding", key: "cryptex", room: "Jungle Outpost A", producer: "Rachel Gomez", facs: ["Aiman Yusof", "Jia Hui Low"] },
    { name: "Radio Transmission", key: "radio", room: "Signal Hill", producer: "David Ooi", facs: ["Ravi Chandran"] },
    { name: "Toxic Waste Crane", key: "toxic", room: "Lagoon Deck 1", producer: "Marcus Tan", facs: ["Nurul Huda", "Wei Jie Ng"] },
    { name: "Raft Construction", key: "raft", room: "Coastal Lagoon", producer: "Siti Zubaidah", facs: ["Chloe Lim", "Farhan Idris"] },
    { name: "Final Island Portal Unlock", key: "portal", room: "Summit Clearing", producer: "—", facs: ["Daniel Koh"] },
  ];
  for (const s of stationData) {
    const station = await prisma.station.create({
      data: { eventId, name: s.name, challengeId: chByKey[s.key]?.id, room: s.room, capacity: 22, durationMin: 40 },
    });
    if (s.producer !== "—") {
      await prisma.crewAssignment.create({
        data: { eventId, stationId: station.id, crewMemberId: pid.get(s.producer), roleTitle: "Station Producer", type: "FullTime", status: "Confirmed", source: "manual" },
      });
    }
    for (const f of s.facs) {
      await prisma.crewAssignment.create({
        data: { eventId, stationId: station.id, crewMemberId: pid.get(f), roleTitle: "Station Facilitator", type: "PartTime", status: "Confirmed", source: "manual" },
      });
    }
  }

  // Flow blocks (+ duties + gear)
  type Duty = { kind: string; roleTitle: string; stationsLabel?: string; crew: string[]; duties: string[] };
  const flow: { start: string; end: string; phase: string; title: string; order: number; desc: string; gear: string[]; duties: Duty[] }[] = [
    { start: "08:00", end: "09:00", phase: "Setup & Load-in", title: "Escape Zone Staging & Secret Clue Hiding", order: 0,
      desc: "Set up station clue boxes, plant locked ammo cases in concealed terrain, test UV blacklights and radios.",
      gear: ["Lock combinations sheet", "Radio frequency tester", "Battery chargers"],
      duties: [
        { kind: "producer", roleTitle: "Lead Game Master", crew: ["Rachel Gomez"], duties: ["Verify all combination lock codes against master key sheet", "Brief venue staff on noise boundaries"] },
        { kind: "producer", roleTitle: "Prop Master", crew: ["David Ooi"], duties: ["Distribute bamboo bundles and toxic waste rigs to Stations 3 and 4"] },
        { kind: "facilitator", roleTitle: "Clue Riggers", stationsLabel: "All Stations", crew: ["Facilitator 1", "Facilitator 2"], duties: ["Place sealed clue envelopes in designated hiding spots", "Check battery charge in UV torches"] },
      ] },
    { start: "09:00", end: "09:30", phase: "Crew Briefing", title: "Facilitator Clue-Giving & Riddle Protocol Briefing", order: 1,
      desc: "Align facilitators on hint-tiering, scoring triggers and the no-spoiler escalation ladder.",
      gear: ["Facilitator briefing deck", "Radio call-sign card"],
      duties: [
        { kind: "producer", roleTitle: "Lead Game Master", crew: ["Rachel Gomez"], duties: ["Walk through hint-tier scoring deductions", "Assign radio call-signs per station"] },
        { kind: "facilitator", roleTitle: "Station Facilitators", stationsLabel: "All Stations", crew: ["Full crew"], duties: ["Memorise riddle answer keys", "Sync stopwatches to arena clock"] },
      ] },
    { start: "09:30", end: "10:00", phase: "Arrival & Registration", title: "Team Check-in & Expedition Kit Issue", order: 2,
      desc: "Welcome delegates, assign teams, issue wristbands, waterproof kit bags and compasses.",
      gear: ["Team wristbands", "Waterproof kit bags", "Delegate waivers"],
      duties: [
        { kind: "producer", roleTitle: "Front of House Lead", crew: ["Preethi Raj"], duties: ["Run team assignment desk", "Hand off waiver forms to safety officer"] },
        { kind: "facilitator", roleTitle: "Registration Crew", stationsLabel: "Base Camp", crew: ["Facilitator 3", "Facilitator 4"], duties: ["Issue team wristbands by colour", "Fit life vests for lagoon stations"] },
      ] },
    { start: "10:00", end: "10:30", phase: "Kickoff & Icebreaker", title: "Opening Ceremony & Marooned Narrative Launch", order: 3,
      desc: "Set the story: teams are shipwrecked and must solve island challenges to unlock the escape portal.",
      gear: ["PA system", "Team flags & markers", "Air horn"],
      duties: [
        { kind: "producer", roleTitle: "Emcee / Game Master", crew: ["Rachel Gomez"], duties: ["Deliver narrative framing & safety brief", "Fire starting horn"] },
        { kind: "facilitator", roleTitle: "Energisers", stationsLabel: "Base Camp", crew: ["Full crew"], duties: ["Run 10-min team chant & flag-making", "Position teams at first stations"] },
      ] },
    { start: "10:30", end: "12:30", phase: "Main Challenge Rotations", title: "5-Station Tournament Rotation Block", order: 4,
      desc: "Teams rotate through all five challenge stations on the 24-minute arena clock; scores logged live.",
      gear: ["Arena clock display", "Scoring tablets", "Station reset kits"],
      duties: [
        { kind: "producer", roleTitle: "Rotation Controller", crew: ["Marcus Tan"], duties: ["Run arena clock & round transitions", "Resolve scoring disputes"] },
        { kind: "facilitator", roleTitle: "Station Facilitators", stationsLabel: "All Stations", crew: ["Station crews 1–5"], duties: ["Score each team against the rubric", "Reset station between rotations"] },
      ] },
    { start: "12:30", end: "13:30", phase: "Expedition Lunch & Reset", title: "Castaway Lunch & Mid-Game Reset", order: 5,
      desc: "Networking lunch at the lagoon while crews reset stations for the finals block.",
      gear: ["Survival ration packs", "Hydration station", "Spare batteries"],
      duties: [
        { kind: "producer", roleTitle: "Logistics Lead", crew: ["David Ooi"], duties: ["Coordinate F&B headcount & dietary tags", "Supervise station teardown & re-stage"] },
        { kind: "facilitator", roleTitle: "Reset Crew", stationsLabel: "All Stations", crew: ["Facilitator 5", "Facilitator 6"], duties: ["Restock consumable props", "Recharge radios & tablets"] },
      ] },
    { start: "13:30", end: "15:00", phase: "Deliberation & Finals", title: "Final Island Portal Unlock — Head-to-Head", order: 6,
      desc: "Top teams face the grand portal challenge; live leaderboard projected for the audience.",
      gear: ["Grand portal rig", "Leaderboard projector", "Judge scorecards"],
      duties: [
        { kind: "producer", roleTitle: "Finals Director", crew: ["Rachel Gomez"], duties: ["Run head-to-head bracket", "Confirm final scores with judges"] },
        { kind: "facilitator", roleTitle: "Finals Judges", stationsLabel: "Summit Clearing", crew: ["Lead facilitators"], duties: ["Judge portal unlock sequence", "Log bonus & penalty points"] },
      ] },
    { start: "15:00", end: "16:00", phase: "Awards & Closing", title: "Awards Ceremony & Compass Handover", order: 7,
      desc: "Crown the champions, hand over vintage brass compass trophies, group photo and client wrap.",
      gear: ["Brass compass trophies", "Medals", "Photo backdrop"],
      duties: [
        { kind: "producer", roleTitle: "Emcee", crew: ["Rachel Gomez"], duties: ["Announce placings & present awards", "Deliver client close & thank-you"] },
        { kind: "facilitator", roleTitle: "Awards Crew", stationsLabel: "Base Camp", crew: ["Facilitator 1", "Facilitator 2"], duties: ["Stage trophies & medals", "Coordinate group photo"] },
      ] },
  ];
  for (const b of flow) {
    const block = await prisma.flowBlock.create({
      data: { eventId, start: b.start, end: b.end, phase: b.phase, title: b.title, description: b.desc, order: b.order, gear: b.gear },
    });
    for (const d of b.duties) {
      await prisma.flowDuty.create({
        data: { flowBlockId: block.id, kind: d.kind, roleTitle: d.roleTitle, stationsLabel: d.stationsLabel ?? null, crew: d.crew, duties: d.duties },
      });
    }
  }

  // Crew hiring roster (Facilitator App mirror) — event-level assignments
  const roster = [
    { name: "Rachel Gomez", role: "Lead Producer / Game Master", type: "FullTime", rate: "RM 1,500/day", status: "Confirmed" },
    { name: "David Ooi", role: "Prop Master / Logistics", type: "FullTime", rate: "RM 1,300/day", status: "Confirmed" },
    { name: "Marcus Tan", role: "Rotation Controller", type: "FullTime", rate: "RM 1,200/day", status: "Confirmed" },
    { name: "Siti Zubaidah", role: "Station Producer", type: "FullTime", rate: "RM 1,150/day", status: "Pending" },
    { name: "Aiman Yusof", role: "Station Facilitator", type: "PartTime", rate: "RM 850/day", status: "Confirmed" },
    { name: "Jia Hui Low", role: "Station Facilitator", type: "PartTime", rate: "RM 850/day", status: "Confirmed" },
    { name: "Ravi Chandran", role: "Station Facilitator", type: "PartTime", rate: "RM 800/day", status: "Pending" },
    { name: "Nurul Huda", role: "Registration Crew", type: "PartTime", rate: "RM 700/day", status: "Confirmed" },
    { name: null, role: "Photographer / Videographer", type: "PartTime", rate: "RM 900/day", status: "Unfilled" },
  ] as const;
  for (const c of roster) {
    await prisma.crewAssignment.create({
      data: { eventId, crewMemberId: c.name ? pid.get(c.name) : null, roleTitle: c.role, type: c.type, status: c.status, rate: c.rate, source: "app" },
    });
  }

  // Procurement
  await prisma.procurementItem.createMany({
    data: [
      { eventId, item: "Weatherproof Heavy Jute Rope (500m spools)", category: "Consumable Props", qty: 4, vendor: "Harbor Marine Rope Supply", urgency: "HIGH", cost: new Prisma.Decimal(120), status: "Received" },
      { eventId, item: "Custom Printed UV Invisible Clue Booklets", category: "Printing", qty: 12, vendor: "InkJet Express", urgency: "MEDIUM", cost: new Prisma.Decimal(95), status: "Received" },
      { eventId, item: "Survival Rations Snack Packs (Trail Mix & Jerky)", category: "Perishable Food", qty: 100, vendor: "NutriWholesale", urgency: "MEDIUM", cost: new Prisma.Decimal(240), status: "Ordered" },
      { eventId, item: "Vintage Brass Compass Souvenirs for Winning Team", category: "Merch / Apparel", qty: 12, vendor: "Nautical Goods Direct", urgency: "LOW", cost: new Prisma.Decimal(140), status: "Ordered" },
    ],
  });

  // Packing
  const packing: [string, [string, boolean][]][] = [
    ["Challenge Props", [["Jute rope spools (4)", true], ["UV invisible clue booklets (12)", true], ["Combination cryptex locks (6)", true], ["Toxic-waste barrels & crane rig", true], ["Bamboo raft construction kits (6)", false], ["UV torches & blacklights (10)", true]]],
    ["AV & Tech", [["PA system + wireless mics", true], ["Walkie-talkies (12) + chargers", true], ["Arena clock display", false], ["Scoring tablets (5)", true], ["Leaderboard projector", false]]],
    ["Safety & Field", [["First aid kits (4)", true], ["Life vests — lagoon stations (24)", true], ["Insect repellent & sunscreen", true], ["Hydration / water stations (3)", false]]],
    ["Branding & Guest", [["Team flags & markers (6 sets)", true], ["Colour-coded wristbands (90)", true], ["Welcome banner & backdrop", false], ["Brass compass trophies (12)", false]]],
  ];
  for (const [category, items] of packing) {
    await prisma.packingItem.createMany({ data: items.map(([name, done]) => ({ eventId, category, name, done })) });
  }

  // Rotation plan (24-min rounds, 6 rounds incl. rest)
  await prisma.rotationPlan.create({ data: { eventId, rounds: 6, roundMinutes: 24, includesRest: true } });

  const counts = {
    events: await prisma.event.count(),
    teams: await prisma.team.count(),
    scores: await prisma.score.count(),
    flow: await prisma.flowBlock.count(),
    crew: await prisma.crewAssignment.count(),
  };
  console.log("Seeded:", counts, "featured event id:", eventId);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
