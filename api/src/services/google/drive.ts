/**
 * Google Drive provisioning (stub).
 *
 * On event create: copy the master template folder (GOOGLE_TEMPLATE_FOLDER_ID)
 * into "EVENT OPS OS Events / <event name>" inside the Shared Drive, create the
 * Decks/ Sheets/ Docs/ subfolders, and return the new folder id. Idempotent:
 * if the event already has a driveFolderId, this is a no-op.
 *
 * Ownership: files belong to the Shared Drive (team-owned), the ops Google
 * Group has Content manager. Confirmed by the Phase 0 spike.
 */
export interface ProvisionResult {
  id: string;
  url: string;
  subfolders: { decks: string; sheets: string; docs: string };
}

export async function provisionEventFolder(eventId: string, eventName: string): Promise<ProvisionResult> {
  void eventId;
  void eventName;
  throw new Error("Not implemented: Drive folder provisioning (Phase 0 spike)");
}
