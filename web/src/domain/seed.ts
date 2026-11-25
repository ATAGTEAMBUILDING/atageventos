import type {
  EventSummary,
  EventWorkspaceData,
  Team,
  Challenge,
  TeamScore,
  Station,
  FlowBlock,
  CrewMember,
  ProcurementItem,
  PackingGroup,
  EventDetail,
} from "./types";

export const DRIVE_URL =
  "https://drive.google.com/drive/folders/1fvBGdH5kUBmoKAK4vNZImT2N5D-iVi6C?usp=sharing";
export const PARENT_FOLDER = "EVENT OPS OS Events";

export const DASHBOARD_EVENTS: EventSummary[] = [
  { id: "e1", name: "Grab Engineering Leadership Summit 2026", client: "Grab Holdings", venue: "Bintan Lagoon Adventure Camp", city: "Riau Islands", start: "2026-10-24", end: "2026-10-24", status: "Planning", pax: 90, teams: 6, readiness: 76 },
  { id: "e2", name: "Maybank Graduate Bootcamp", client: "Maybank Group", venue: "Menara Maybank", city: "Kuala Lumpur", start: "2026-02-03", end: "2026-02-03", status: "Ready", pax: 84, teams: 7, readiness: 95 },
  { id: "e3", name: "Shopee Sales Gladiators", client: "Shopee", venue: "Sentosa Island", city: "Singapore", start: "2026-01-29", end: "2026-01-29", status: "Live", pax: 120, teams: 10, readiness: 100 },
  { id: "e4", name: "Petronas Leadership Odyssey", client: "Petronas", venue: "TBD", city: "Langkawi", start: "2026-04-05", end: "2026-04-06", status: "Draft", pax: 0, teams: 0, readiness: 18 },
  { id: "e5", name: "AirAsia Culture Carnival", client: "AirAsia", venue: "Sepang Int'l Circuit", city: "Selangor", start: "2025-11-08", end: "2025-11-08", status: "Complete", pax: 200, teams: 16, readiness: 100 },
];

const FEATURE: EventDetail = {
  id: "e1",
  client: "Grab Holdings",
  codename: "The Island Escape Expedition",
  name: "Grab Engineering Leadership Summit 2026",
  start: "2026-10-24",
  end: "2026-10-24",
  time: "09:00 – 16:00",
  venue: "Bintan Lagoon Adventure Camp, Riau Islands",
  city: "Riau Islands",
  zone: "Jungle Outpost & Coastal Lagoon",
  tz: "Asia/Jakarta (WIB, UTC+7)",
  status: "Planning",
  pax: 90,
  teams: 6,
  readiness: 76,
  producer: "Rachel Gomez",
  producerRole: "Operations Control",
};

const TEAMS: Team[] = [
  { id: "t1", name: "The Algorithmic Castaways", color: "#16A34A", order: 0 },
  { id: "t2", name: "Payload Pioneers", color: "#2563EB", order: 1 },
  { id: "t3", name: "Distributed Nomads", color: "#D97706", order: 2 },
  { id: "t4", name: "Bintan Byte-Busters", color: "#7A3DB5", order: 3 },
  { id: "t5", name: "Kubernetes Raft Crew", color: "#0E7C86", order: 4 },
  { id: "t6", name: "Zero Downtime Explorers", color: "#DC2626", order: 5 },
];

const CHALLENGES: Challenge[] = [
  { key: "cryptex", label: "Cryptex Decoding", max: 100, order: 0 },
  { key: "radio", label: "Radio Transmission", max: 100, order: 1 },
  { key: "toxic", label: "Toxic Waste Crane", max: 100, order: 2 },
  { key: "raft", label: "Raft Construction", max: 120, order: 3 },
  { key: "portal", label: "Final Island Portal Unlock", max: 150, order: 4 },
];

const SCORES: TeamScore[] = [
  { teamId: "t1", points: { cryptex: 100, radio: 90, toxic: 0, raft: 0, portal: 0 }, bonus: 0, penalty: 0 },
  { teamId: "t2", points: { cryptex: 95, radio: 85, toxic: 0, raft: 0, portal: 0 }, bonus: 0, penalty: 0 },
  { teamId: "t3", points: { cryptex: 80, radio: 95, toxic: 0, raft: 0, portal: 0 }, bonus: 0, penalty: 5 },
  { teamId: "t4", points: { cryptex: 90, radio: 70, toxic: 0, raft: 0, portal: 0 }, bonus: 0, penalty: 0 },
  { teamId: "t5", points: { cryptex: 75, radio: 80, toxic: 0, raft: 0, portal: 0 }, bonus: 0, penalty: 0 },
  { teamId: "t6", points: { cryptex: 70, radio: 75, toxic: 0, raft: 0, portal: 0 }, bonus: 0, penalty: 0 },
];

const STATIONS: Station[] = [
  { id: "S1", name: "Cryptex Decoding", challengeKey: "cryptex", room: "Jungle Outpost A", producer: "Rachel Gomez", facilitators: ["Aiman Yusof", "Jia Hui Low"] },
  { id: "S2", name: "Radio Transmission", challengeKey: "radio", room: "Signal Hill", producer: "David Ooi", facilitators: ["Ravi Chandran"] },
  { id: "S3", name: "Toxic Waste Crane", challengeKey: "toxic", room: "Lagoon Deck 1", producer: "Marcus Tan", facilitators: ["Nurul Huda", "Wei Jie Ng"] },
  { id: "S4", name: "Raft Construction", challengeKey: "raft", room: "Coastal Lagoon", producer: "Siti Zubaidah", facilitators: ["Chloe Lim", "Farhan Idris"] },
  { id: "S5", name: "Final Island Portal Unlock", challengeKey: "portal", room: "Summit Clearing", producer: "—", facilitators: ["Daniel Koh"] },
];

const FLOW: FlowBlock[] = [
  {
    id: 1, start: "08:00", end: "09:00", durationMin: 60, phase: "Setup & Load-in", title: "Escape Zone Staging & Secret Clue Hiding",
    description: "Set up station clue boxes, plant locked ammo cases in concealed terrain, test UV blacklights and radios.",
    producers: [
      { role: "Lead Game Master", who: "Rachel Gomez", duties: ["Verify all combination lock codes against master key sheet", "Brief venue staff on noise boundaries"] },
      { role: "Prop Master", who: "David Ooi", duties: ["Distribute bamboo bundles and toxic waste rigs to Stations 3 and 4"] },
    ],
    facilitators: [
      { role: "Clue Riggers", stations: "All Stations", crew: ["Facilitator 1", "Facilitator 2"], duties: ["Place sealed clue envelopes in designated hiding spots", "Check battery charge in UV torches"] },
    ],
    gear: ["Lock combinations sheet", "Radio frequency tester", "Battery chargers"],
  },
  {
    id: 2, start: "09:00", end: "09:30", durationMin: 30, phase: "Crew Briefing", title: "Facilitator Clue-Giving & Riddle Protocol Briefing",
    description: "Align facilitators on hint-tiering, scoring triggers and the no-spoiler escalation ladder.",
    producers: [{ role: "Lead Game Master", who: "Rachel Gomez", duties: ["Walk through hint-tier scoring deductions", "Assign radio call-signs per station"] }],
    facilitators: [{ role: "Station Facilitators", stations: "All Stations", crew: ["Full crew"], duties: ["Memorise riddle answer keys", "Sync stopwatches to arena clock"] }],
    gear: ["Facilitator briefing deck", "Radio call-sign card"],
  },
  {
    id: 3, start: "09:30", end: "10:00", durationMin: 30, phase: "Arrival & Registration", title: "Team Check-in & Expedition Kit Issue",
    description: "Welcome delegates, assign teams, issue wristbands, waterproof kit bags and compasses.",
    producers: [{ role: "Front of House Lead", who: "Preethi Raj", duties: ["Run team assignment desk", "Hand off waiver forms to safety officer"] }],
    facilitators: [{ role: "Registration Crew", stations: "Base Camp", crew: ["Facilitator 3", "Facilitator 4"], duties: ["Issue team wristbands by colour", "Fit life vests for lagoon stations"] }],
    gear: ["Team wristbands", "Waterproof kit bags", "Delegate waivers"],
  },
  {
    id: 4, start: "10:00", end: "10:30", durationMin: 30, phase: "Kickoff & Icebreaker", title: "Opening Ceremony & Marooned Narrative Launch",
    description: "Set the story: teams are shipwrecked and must solve island challenges to unlock the escape portal.",
    producers: [{ role: "Emcee / Game Master", who: "Rachel Gomez", duties: ["Deliver narrative framing & safety brief", "Fire starting horn"] }],
    facilitators: [{ role: "Energisers", stations: "Base Camp", crew: ["Full crew"], duties: ["Run 10-min team chant & flag-making", "Position teams at first stations"] }],
    gear: ["PA system", "Team flags & markers", "Air horn"],
  },
  {
    id: 5, start: "10:30", end: "12:30", durationMin: 120, phase: "Main Challenge Rotations", title: "5-Station Tournament Rotation Block",
    description: "Teams rotate through all five challenge stations on the 24-minute arena clock; scores logged live.",
    producers: [{ role: "Rotation Controller", who: "Marcus Tan", duties: ["Run arena clock & round transitions", "Resolve scoring disputes"] }],
    facilitators: [{ role: "Station Facilitators", stations: "All Stations", crew: ["Station crews 1–5"], duties: ["Score each team against the rubric", "Reset station between rotations"] }],
    gear: ["Arena clock display", "Scoring tablets", "Station reset kits"],
  },
  {
    id: 6, start: "12:30", end: "13:30", durationMin: 60, phase: "Expedition Lunch & Reset", title: "Castaway Lunch & Mid-Game Reset",
    description: "Networking lunch at the lagoon while crews reset stations for the finals block.",
    producers: [{ role: "Logistics Lead", who: "David Ooi", duties: ["Coordinate F&B headcount & dietary tags", "Supervise station teardown & re-stage"] }],
    facilitators: [{ role: "Reset Crew", stations: "All Stations", crew: ["Facilitator 5", "Facilitator 6"], duties: ["Restock consumable props", "Recharge radios & tablets"] }],
    gear: ["Survival ration packs", "Hydration station", "Spare batteries"],
  },
  {
    id: 7, start: "13:30", end: "15:00", durationMin: 90, phase: "Deliberation & Finals", title: "Final Island Portal Unlock — Head-to-Head",
    description: "Top teams face the grand portal challenge; live leaderboard projected for the audience.",
    producers: [{ role: "Finals Director", who: "Rachel Gomez", duties: ["Run head-to-head bracket", "Confirm final scores with judges"] }],
    facilitators: [{ role: "Finals Judges", stations: "Summit Clearing", crew: ["Lead facilitators"], duties: ["Judge portal unlock sequence", "Log bonus & penalty points"] }],
    gear: ["Grand portal rig", "Leaderboard projector", "Judge scorecards"],
  },
  {
    id: 8, start: "15:00", end: "16:00", durationMin: 60, phase: "Awards & Closing", title: "Awards Ceremony & Compass Handover",
    description: "Crown the champions, hand over vintage brass compass trophies, group photo and client wrap.",
    producers: [{ role: "Emcee", who: "Rachel Gomez", duties: ["Announce placings & present awards", "Deliver client close & thank-you"] }],
    facilitators: [{ role: "Awards Crew", stations: "Base Camp", crew: ["Facilitator 1", "Facilitator 2"], duties: ["Stage trophies & medals", "Coordinate group photo"] }],
    gear: ["Brass compass trophies", "Medals", "Photo backdrop"],
  },
];

const CREW: CrewMember[] = [
  { name: "Rachel Gomez", role: "Lead Producer / Game Master", type: "Full-time", rate: "RM 1,500/day", status: "Confirmed", rating: 4.9 },
  { name: "David Ooi", role: "Prop Master / Logistics", type: "Full-time", rate: "RM 1,300/day", status: "Confirmed", rating: 4.8 },
  { name: "Marcus Tan", role: "Rotation Controller", type: "Full-time", rate: "RM 1,200/day", status: "Confirmed", rating: 4.7 },
  { name: "Siti Zubaidah", role: "Station Producer", type: "Full-time", rate: "RM 1,150/day", status: "Pending", rating: 4.6 },
  { name: "Aiman Yusof", role: "Station Facilitator", type: "Part-time", rate: "RM 850/day", status: "Confirmed", rating: 4.5 },
  { name: "Jia Hui Low", role: "Station Facilitator", type: "Part-time", rate: "RM 850/day", status: "Confirmed", rating: 4.6 },
  { name: "Ravi Chandran", role: "Station Facilitator", type: "Part-time", rate: "RM 800/day", status: "Pending", rating: 4.4 },
  { name: "Nurul Huda", role: "Registration Crew", type: "Part-time", rate: "RM 700/day", status: "Confirmed", rating: 4.7 },
  { name: "—", role: "Photographer / Videographer", type: "Part-time", rate: "RM 900/day", status: "Unfilled", rating: null },
];

const PROCUREMENT: ProcurementItem[] = [
  { id: "p1", item: "Weatherproof Heavy Jute Rope (500m spools)", category: "Consumable Props", qty: 4, vendor: "Harbor Marine Rope Supply", urgency: "HIGH", cost: 120, status: "Received on Site" },
  { id: "p2", item: "Custom Printed UV Invisible Clue Booklets", category: "Printing", qty: 12, vendor: "InkJet Express", urgency: "MEDIUM", cost: 95, status: "Received on Site" },
  { id: "p3", item: "Survival Rations Snack Packs (Trail Mix & Jerky)", category: "Perishable Food", qty: 100, vendor: "NutriWholesale", urgency: "MEDIUM", cost: 240, status: "Ordered (In Transit)" },
  { id: "p4", item: "Vintage Brass Compass Souvenirs for Winning Team", category: "Merch / Apparel", qty: 12, vendor: "Nautical Goods Direct", urgency: "LOW", cost: 140, status: "Ordered (In Transit)" },
];

const PACKING: PackingGroup[] = [
  { category: "Challenge Props", items: [
    { name: "Jute rope spools (4)", done: true }, { name: "UV invisible clue booklets (12)", done: true }, { name: "Combination cryptex locks (6)", done: true },
    { name: "Toxic-waste barrels & crane rig", done: true }, { name: "Bamboo raft construction kits (6)", done: false }, { name: "UV torches & blacklights (10)", done: true }] },
  { category: "AV & Tech", items: [
    { name: "PA system + wireless mics", done: true }, { name: "Walkie-talkies (12) + chargers", done: true }, { name: "Arena clock display", done: false },
    { name: "Scoring tablets (5)", done: true }, { name: "Leaderboard projector", done: false }] },
  { category: "Safety & Field", items: [
    { name: "First aid kits (4)", done: true }, { name: "Life vests — lagoon stations (24)", done: true }, { name: "Insect repellent & sunscreen", done: true },
    { name: "Hydration / water stations (3)", done: false }] },
  { category: "Branding & Guest", items: [
    { name: "Team flags & markers (6 sets)", done: true }, { name: "Colour-coded wristbands (90)", done: true }, { name: "Welcome banner & backdrop", done: false },
    { name: "Brass compass trophies (12)", done: false }] },
];

const DECK = [
  "Title — The Island Escape Expedition", "Welcome & Marooned Narrative", "Safety Brief & Ground Rules", "Agenda / Run-of-Show", "Meet Your 6 Teams",
  "Station 1 — Cryptex Decoding", "Station 2 — Radio Transmission", "Station 3 — Toxic Waste Crane", "Station 4 — Raft Construction", "Station 5 — Final Island Portal Unlock",
  "Live Leaderboard", "Awards & Thank You",
];

export const WORKSPACE_SEED: EventWorkspaceData = {
  event: FEATURE,
  teams: TEAMS,
  challenges: CHALLENGES,
  scores: SCORES,
  stations: STATIONS,
  flow: FLOW,
  crew: CREW,
  procurement: PROCUREMENT,
  packing: PACKING,
  deck: DECK,
  budgetAllocUsd: 600,
  roundSeconds: 24 * 60,
  rounds: 6,
};
