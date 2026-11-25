/**
 * Deliverable generation (stub).
 *
 * Per the design doc's template→output mapping:
 *   run-sheet   -> Google Doc   (Docs API batchUpdate replaceAllText on {{tokens}})
 *   score-sheet -> Google Sheet (Sheets API values.update into named ranges)
 *   deck        -> Google Slides (duplicate deck, replaceAllText, per-station slides)
 *   name-tags   -> Google Doc   (mail-merge from roster)
 *   calendar    -> Google Calendar event (ops call time)
 *
 * Each call copies the template into the event's Drive folder, merges live
 * data, and records { driveFileId, url, state, generatedAt } on the Deliverable
 * row. Mechanism (Google APIs vs. Apps Script for Slides) confirmed by the spike.
 */
export type DeliverableKind = "run-sheet" | "score-sheet" | "deck" | "name-tags" | "calendar";

export interface GenerateResult {
  kind: string;
  driveFileId: string;
  url: string;
  state: "Done";
  generatedAt: string;
}

export async function generateDeliverable(eventId: string, kind: string): Promise<GenerateResult> {
  void eventId;
  void kind;
  throw new Error(`Not implemented: generate '${kind}' (Phase 0 spike)`);
}
