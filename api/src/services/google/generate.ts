/**
 * Deliverable generation. Grounded in the Phase 0 spike:
 *   - deck        -> Google Slides: copy template, duplicate slides, replaceAllText  (Task 5 ✓)
 *   - score-sheet -> Google Sheets: copy template, write values to a tab             (Task 4 ✓)
 *   - run-sheet   -> Google Sheets (your "Activity Event Flow" templates are Sheets)
 *
 * The spike found 22 Sheet templates / 2 Slides decks / 0 Docs, and NO named
 * ranges — so Sheets are addressed by `Tab!A1`. Template file ids come from env
 * (resolved once the templates are standardised with {{tokens}} and known tabs).
 */
import { prisma } from "../../lib/prisma.js";
import { DeliverableKind, GenerationState } from "@prisma/client";
import { googleClients } from "./clients.js";
import { copyTemplate, listChildren } from "./drive.js";

export type Kind = "deck" | "score-sheet" | "run-sheet";

const TEMPLATES: Record<Kind, { envId: string; subfolder: string; type: "slides" | "sheet"; deliverable: DeliverableKind }> = {
  deck: { envId: "GOOGLE_TEMPLATE_DECK_ID", subfolder: "Decks", type: "slides", deliverable: "Slides" },
  "score-sheet": { envId: "GOOGLE_TEMPLATE_SCORESHEET_ID", subfolder: "Sheets", type: "sheet", deliverable: "Sheets" },
  "run-sheet": { envId: "GOOGLE_TEMPLATE_RUNSHEET_ID", subfolder: "Sheets", type: "sheet", deliverable: "Sheets" },
};

export interface GenerateResult {
  kind: string;
  driveFileId: string;
  url: string;
  state: "Done";
  generatedAt: string;
}

export async function generateDeliverable(eventId: string, kindRaw: string): Promise<GenerateResult> {
  const cfg = TEMPLATES[kindRaw as Kind];
  if (!cfg) throw new Error(`unknown deliverable kind: ${kindRaw}`);
  const templateId = process.env[cfg.envId];
  if (!templateId) throw new Error(`${cfg.envId} is not set (template file id for ${kindRaw})`);

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { teams: { include: { scores: true }, orderBy: { order: "asc" } }, challenges: { orderBy: { order: "asc" } } },
  });
  if (!event) throw new Error("event not found");
  if (!event.driveFolderId) throw new Error("event has no Drive folder; provision it first");

  const subId = await resolveSubfolder(event.driveFolderId, cfg.subfolder);
  const copy = await copyTemplate(templateId, `${event.name} — ${kindRaw}`, subId);
  const fileId = copy.id!;

  if (cfg.type === "slides") await mergeSlides(fileId, tokenMap(event));
  else await writeScores(fileId, event);

  await prisma.deliverable.create({
    data: {
      eventId,
      kind: cfg.deliverable,
      templateId,
      driveFileId: fileId,
      url: copy.webViewLink ?? null,
      state: GenerationState.Done,
      generatedAt: new Date(),
    },
  });

  return { kind: kindRaw, driveFileId: fileId, url: copy.webViewLink ?? "", state: "Done", generatedAt: new Date().toISOString() };
}

// ---- helpers ----------------------------------------------------------------

async function resolveSubfolder(eventFolderId: string, name: string): Promise<string> {
  const children = await listChildren(eventFolderId);
  const match = children.find((c) => c.name === name);
  return match?.id ?? eventFolderId; // fall back to the event folder itself
}

/** {{token}} -> value, for Slides / Docs replaceAllText. */
function tokenMap(event: { name: string; client: string; venue: string; date: Date; codename: string | null }): Record<string, string> {
  return {
    event_name: event.name,
    client: event.client,
    venue: event.venue,
    date: event.date.toISOString().slice(0, 10),
    codename: event.codename ?? "",
  };
}

async function mergeSlides(presentationId: string, tokens: Record<string, string>) {
  const { slides } = googleClients();
  const requests = Object.entries(tokens).map(([k, v]) => ({
    replaceAllText: { containsText: { text: `{{${k}}}`, matchCase: false }, replaceText: v },
  }));
  await slides.presentations.batchUpdate({ presentationId, requestBody: { requests } });
}

/** Write the live leaderboard into the score sheet. Tab via env, default "Activity Master". */
async function writeScores(
  spreadsheetId: string,
  event: { challenges: { key: string; label: string }[]; teams: { name: string; bonusPoints: number; penaltyPoints: number; scores: { challengeId: string; points: number }[] }[] }
) {
  const { sheets } = googleClients();
  const tab = process.env.GOOGLE_SCORESHEET_TAB ?? "Activity Master";
  const header = ["Team", ...event.challenges.map((c) => c.label), "Bonus", "Penalty", "Total"];
  const rows = event.teams.map((t) => {
    const pts = event.challenges.map((c) => t.scores.find((s) => s.challengeId === c.key)?.points ?? 0);
    const total = pts.reduce((a, b) => a + b, 0) + t.bonusPoints - t.penaltyPoints;
    return [t.name, ...pts, t.bonusPoints, t.penaltyPoints, total];
  });
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${tab}!A1`,
    valueInputOption: "RAW",
    requestBody: { values: [header, ...rows] },
  });
}
