/**
 * Drive provisioning. Proven by the Phase 0 spike (Task 2): create a per-event
 * folder under "EVENT OPS OS Events" with Decks/ Sheets/ Docs/ subfolders.
 * Idempotent at the caller (events.ts skips when the Event already has a
 * driveFolderId).
 *
 * GOOGLE_EVENTS_FOLDER_ID = the "EVENT OPS OS Events" folder id (ideally inside
 * a Shared Drive once one is created, so files are team-owned).
 */
import { googleClients, ALL_DRIVES, MIME } from "./clients.js";

export interface ProvisionResult {
  id: string;
  url: string;
  subfolders: { decks: string; sheets: string; docs: string };
}

export async function provisionEventFolder(_eventId: string, eventName: string): Promise<ProvisionResult> {
  const parent = process.env.GOOGLE_EVENTS_FOLDER_ID;
  if (!parent) throw new Error("GOOGLE_EVENTS_FOLDER_ID is not set (the 'EVENT OPS OS Events' folder)");
  const { drive } = googleClients();

  const folder = await drive.files.create({
    requestBody: { name: eventName, mimeType: MIME.folder, parents: [parent] },
    fields: "id,webViewLink",
    supportsAllDrives: true,
  });
  const id = folder.data.id!;

  const sub = async (name: string) => {
    const r = await drive.files.create({
      requestBody: { name, mimeType: MIME.folder, parents: [id] },
      fields: "id",
      supportsAllDrives: true,
    });
    return r.data.id!;
  };
  const [decks, sheets, docs] = await Promise.all([sub("Decks"), sub("Sheets"), sub("Docs")]);

  return { id, url: folder.data.webViewLink ?? `https://drive.google.com/drive/folders/${id}`, subfolders: { decks, sheets, docs } };
}

/** Copy a template file into a destination folder, returning the new file. */
export async function copyTemplate(templateFileId: string, name: string, parentFolderId: string) {
  const { drive } = googleClients();
  const r = await drive.files.copy({
    fileId: templateFileId,
    requestBody: { name, parents: [parentFolderId] },
    fields: "id,name,mimeType,webViewLink",
    supportsAllDrives: true,
  });
  return r.data;
}

/** List a folder's children (used to resolve which template to copy). */
export async function listChildren(folderId: string) {
  const { drive } = googleClients();
  const r = await drive.files.list({
    q: `'${folderId}' in parents and trashed=false`,
    fields: "files(id,name,mimeType)",
    pageSize: 200,
    ...ALL_DRIVES,
  });
  return r.data.files ?? [];
}
