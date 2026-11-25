/**
 * EventOps OS — Phase 0 spike (v2: recurses into template subfolders).
 *
 * Proves, against the REAL "EVENT OPS OS Events" template, that a Google
 * identity can: provision a per-event folder, copy the templates, merge live
 * data into a Doc / Sheet / Slides, set sharing, and shows whether files end up
 * team-owned (Shared Drive) or personal. Throwaway code; the output is DECISIONS.
 *
 * Run it in Google Cloud Shell or any machine where the service account lives.
 * See README.md. Nothing here is secret — auth comes from ADC /
 * GOOGLE_APPLICATION_CREDENTIALS, never from this file.
 */
import { google } from "googleapis";

const TEMPLATE_FOLDER_ID = process.env.TEMPLATE_FOLDER_ID || "1fvBGdH5kUBmoKAK4vNZImT2N5D-iVi6C";
const PARENT_FOLDER_ID = process.env.PARENT_FOLDER_ID || ""; // where to create the event folder; default = the "EVENT OPS OS Events" subfolder
const OPS_GROUP_EMAIL = process.env.OPS_GROUP_EMAIL || "";
const TEST_VIEWER_EMAIL = process.env.TEST_VIEWER_EMAIL || "";
const CLEANUP = process.env.CLEANUP === "1";

const MIME = {
  folder: "application/vnd.google-apps.folder",
  doc: "application/vnd.google-apps.document",
  sheet: "application/vnd.google-apps.spreadsheet",
  slides: "application/vnd.google-apps.presentation",
};
const SCOPES = [
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/documents",
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/presentations",
];
const ALL_DRIVES = { supportsAllDrives: true, includeItemsFromAllDrives: true };

const results = [];
const record = (task, status, detail) => {
  results.push({ task, status, detail });
  const mark = status === "PASS" ? "✓" : status === "SKIP" ? "–" : "✗";
  console.log(`\n[${mark} ${status}] ${task}\n    ${detail}`);
};
const sample = {
  event_name: "Island Escape — SPIKE TEST",
  date: "2026-10-24",
  venue: "Bintan Lagoon Adventure Camp",
  team: "The Algorithmic Castaways",
  station: "Cryptex Decoding",
};

async function main() {
  const auth = new google.auth.GoogleAuth({ scopes: SCOPES });
  const drive = google.drive({ version: "v3", auth });
  const docs = google.docs({ version: "v1", auth });
  const sheets = google.sheets({ version: "v4", auth });
  const slides = google.slides({ version: "v1", auth });

  let driveId = null;
  let newFolderId = null;
  const tpl = { doc: null, sheet: null, slides: null }; // template file ids to copy
  const copied = { doc: null, sheet: null, slides: null };
  let inventory = [];

  // ---- Task 1: Auth + recursive inventory ----------------------------------
  try {
    const me = await drive.about.get({ fields: "user" });
    const root = await drive.files.get({ fileId: TEMPLATE_FOLDER_ID, fields: "id,name,driveId", supportsAllDrives: true });
    driveId = root.data.driveId || null;
    inventory = await walk(drive, TEMPLATE_FOLDER_ID, root.data.name, 0);

    const byType = (m) => inventory.filter((f) => f.mimeType === m);
    tpl.doc = byType(MIME.doc)[0]?.id || null;
    tpl.sheet = byType(MIME.sheet)[0]?.id || null;
    tpl.slides = byType(MIME.slides)[0]?.id || null;
    const topFolders = inventory.filter((f) => f.depth === 0 && f.mimeType === MIME.folder).map((f) => f.name);

    record(
      "1. Auth + recursive inventory",
      "PASS",
      `as ${me.data.user?.emailAddress}; "${root.data.name}" ${driveId ? `on Shared Drive ${driveId}` : "on My Drive"}\n` +
        `    top-level folders: ${topFolders.join(", ")}\n` +
        `    found across all levels — Docs: ${byType(MIME.doc).length}, Sheets: ${byType(MIME.sheet).length}, Slides: ${byType(MIME.slides).length}\n` +
        `    first Doc/Sheet/Slides to test: ${label(byType(MIME.doc)[0])} | ${label(byType(MIME.sheet)[0])} | ${label(byType(MIME.slides)[0])}`
    );
  } catch (e) {
    record("1. Auth + recursive inventory", "FAIL", msg(e));
    return finish();
  }

  // ---- Task 2: Provision — copy real templates into a new event folder -----
  try {
    const eventsParent = inventory.find((f) => f.mimeType === MIME.folder && /event ops os events/i.test(f.name));
    const parent = PARENT_FOLDER_ID || eventsParent?.id || (await parentOf(drive, TEMPLATE_FOLDER_ID)) || driveId;
    const name = `TEST EVENT ${new Date().toISOString().replace(/[:.]/g, "-")}`;
    const folder = await drive.files.create({
      requestBody: { name, mimeType: MIME.folder, parents: parent ? [parent] : undefined },
      fields: "id,webViewLink",
      supportsAllDrives: true,
    });
    newFolderId = folder.data.id;
    for (const sub of ["Decks", "Sheets", "Docs"]) {
      await drive.files.create({ requestBody: { name: sub, mimeType: MIME.folder, parents: [newFolderId] }, fields: "id", supportsAllDrives: true });
    }
    for (const kind of ["doc", "sheet", "slides"]) {
      if (!tpl[kind]) continue;
      const c = await drive.files.copy({
        fileId: tpl[kind],
        requestBody: { name: `Island Escape — ${kind}`, parents: [newFolderId] },
        fields: "id,name,mimeType",
        supportsAllDrives: true,
      });
      copied[kind] = c.data.id;
    }
    record(
      "2. Provision event folder",
      "PASS",
      `created "${name}" under ${eventsParent ? `"EVENT OPS OS Events"` : "template parent"}\n    ${folder.data.webViewLink}\n` +
        `    copied templates — doc:${!!copied.doc} sheet:${!!copied.sheet} slides:${!!copied.slides}`
    );
  } catch (e) {
    record("2. Provision event folder", "FAIL", msg(e));
  }

  // ---- Task 3: Docs merge ---------------------------------------------------
  try {
    const docId = copied.doc || (await makeTempDoc(drive, docs, newFolderId));
    const reqs = Object.entries(sample).map(([k, v]) => ({ replaceAllText: { containsText: { text: `{{${k}}}`, matchCase: false }, replaceText: v } }));
    const r = await docs.documents.batchUpdate({ documentId: docId, requestBody: { requests: reqs } });
    const replaced = (r.data.replies || []).reduce((n, x) => n + (x.replaceAllText?.occurrencesChanged || 0), 0);
    const after = await docs.documents.get({ documentId: docId });
    const leftover = JSON.stringify(after.data).match(/\{\{[a-z_]+\}\}/gi) || [];
    record(
      "3. Docs merge",
      "PASS",
      `${copied.doc ? "on a real template Doc" : "on a temp Doc (no template Doc found)"}: replaced ${replaced} token occurrence(s); ${leftover.length} of our tokens left` +
        (leftover.length ? ` (${[...new Set(leftover)].join(",")} — these are sample tokens, not in your template)` : "")
    );
  } catch (e) {
    record("3. Docs merge", copied.doc ? "FAIL" : "SKIP", msg(e));
  }

  // ---- Task 4: Sheets write named range + read back ------------------------
  try {
    if (!copied.sheet) throw new Error("no Google Sheet template found to test");
    const meta = await sheets.spreadsheets.get({ spreadsheetId: copied.sheet, fields: "namedRanges(name),sheets(properties(title))" });
    const named = meta.data.namedRanges?.[0]?.name;
    const firstSheet = meta.data.sheets?.[0]?.properties?.title;
    const range = named || `${firstSheet || "Sheet1"}!A1`;
    const values = [["Team", "Cryptex", "Radio"], ["The Algorithmic Castaways", 100, 90], ["Payload Pioneers", 95, 85]];
    await sheets.spreadsheets.values.update({ spreadsheetId: copied.sheet, range, valueInputOption: "RAW", requestBody: { values } });
    const back = await sheets.spreadsheets.values.get({ spreadsheetId: copied.sheet, range });
    record(
      "4. Sheets write + read back",
      "PASS",
      `tabs: [${(meta.data.sheets || []).map((s) => s.properties.title).join(", ")}]; ` +
        `named ranges: [${(meta.data.namedRanges || []).map((n) => n.name).join(", ") || "none"}]\n` +
        `    wrote to ${named ? `named range "${named}"` : `"${range}"`}; read back ${back.data.values?.length || 0} rows`
    );
  } catch (e) {
    record("4. Sheets write + read back", copied.sheet ? "FAIL" : "SKIP", msg(e));
  }

  // ---- Task 5: Slides duplicate + replaceAllText ---------------------------
  try {
    if (!copied.slides) throw new Error("no Google Slides template found to test");
    const deck = await slides.presentations.get({ presentationId: copied.slides, fields: "slides.objectId" });
    const n = deck.data.slides?.length || 0;
    const first = deck.data.slides?.[0]?.objectId;
    const reqs = [
      ...(first ? [{ duplicateObject: { objectId: first } }] : []),
      ...Object.entries(sample).map(([k, v]) => ({ replaceAllText: { containsText: { text: `{{${k}}}`, matchCase: false }, replaceText: v } })),
    ];
    const r = await slides.presentations.batchUpdate({ presentationId: copied.slides, requestBody: { requests: reqs } });
    record("5. Slides duplicate + merge", "PASS", `deck had ${n} slides; duplicated slide 1 and applied ${r.data.replies?.length || 0} request(s) incl. token replace`);
  } catch (e) {
    record("5. Slides duplicate + merge", copied.slides ? "FAIL" : "SKIP", msg(e));
  }

  // ---- Task 6: Sharing ------------------------------------------------------
  try {
    if (!newFolderId) throw new Error("no event folder to share");
    const grants = [];
    if (OPS_GROUP_EMAIL) {
      await drive.permissions.create({ fileId: newFolderId, requestBody: { type: "group", role: driveId ? "fileOrganizer" : "writer", emailAddress: OPS_GROUP_EMAIL }, sendNotificationEmail: false, supportsAllDrives: true });
      grants.push(`${OPS_GROUP_EMAIL} as ${driveId ? "Content manager" : "writer"}`);
    }
    if (TEST_VIEWER_EMAIL) {
      await drive.permissions.create({ fileId: newFolderId, requestBody: { type: "user", role: "reader", emailAddress: TEST_VIEWER_EMAIL }, sendNotificationEmail: false, supportsAllDrives: true });
      grants.push(`${TEST_VIEWER_EMAIL} as viewer`);
    }
    const perms = await drive.permissions.list({ fileId: newFolderId, fields: "permissions(type,role,emailAddress)", supportsAllDrives: true });
    record("6. Sharing", grants.length ? "PASS" : "SKIP", grants.length ? `granted ${grants.join("; ")}; folder now has ${perms.data.permissions?.length || 0} permission(s)` : "set OPS_GROUP_EMAIL and/or TEST_VIEWER_EMAIL to test sharing");
  } catch (e) {
    record("6. Sharing", "FAIL", msg(e));
  }

  // ---- Task 7: Ownership ----------------------------------------------------
  try {
    if (!newFolderId) throw new Error("no event folder to inspect");
    const info = await drive.files.get({ fileId: newFolderId, fields: "id,driveId,owners(emailAddress)", supportsAllDrives: true });
    record(
      "7. Ownership check",
      "PASS",
      info.data.driveId
        ? `TEAM-OWNED: files live on Shared Drive ${info.data.driveId}, no individual owner — recommended model confirmed`
        : `PERSONAL-OWNED: owner is ${info.data.owners?.map((o) => o.emailAddress).join(",")}. No Shared Drive yet — create one and move "EVENT OPS OS Events" into it so files are team-owned`
    );
  } catch (e) {
    record("7. Ownership check", "FAIL", msg(e));
  }

  if (CLEANUP && newFolderId) {
    await drive.files.update({ fileId: newFolderId, requestBody: { trashed: true }, supportsAllDrives: true }).catch(() => {});
    console.log(`\n(cleaned up test folder ${newFolderId})`);
  } else if (newFolderId) {
    console.log(`\n(left test folder ${newFolderId} in place — set CLEANUP=1 to trash it)`);
  }
  finish();
}

function finish() {
  console.log("\n" + "=".repeat(64) + "\nPHASE 0 SPIKE SUMMARY\n" + "=".repeat(64));
  for (const r of results) console.log(`  ${r.status.padEnd(4)}  ${r.task}`);
  const pass = results.filter((r) => r.status === "PASS").length;
  console.log(`\n  ${pass}/${results.length} passed. Paste this whole output back to continue.`);
  process.exit(results.some((r) => r.status === "FAIL") ? 1 : 0);
}

// ---- helpers ----------------------------------------------------------------
async function walk(drive, folderId, folderName, depth, acc = []) {
  let pageToken;
  do {
    const res = await drive.files.list({
      q: `'${folderId}' in parents and trashed=false`,
      fields: "nextPageToken, files(id,name,mimeType)",
      pageSize: 200,
      pageToken,
      ...ALL_DRIVES,
    });
    for (const f of res.data.files || []) {
      acc.push({ ...f, parent: folderName, depth });
      if (f.mimeType === MIME.folder && depth < 4) await walk(drive, f.id, f.name, depth + 1, acc);
    }
    pageToken = res.data.nextPageToken;
  } while (pageToken);
  return acc;
}
const label = (f) => (f ? `"${f.name}" (in ${f.parent})` : "none");
const short = (m) => (m || "").replace("application/vnd.google-apps.", "");
const msg = (e) => e?.errors?.[0]?.message || e?.response?.data?.error?.message || e?.message || String(e);
async function parentOf(drive, fileId) {
  const r = await drive.files.get({ fileId, fields: "parents", supportsAllDrives: true });
  return r.data.parents?.[0] || null;
}
async function makeTempDoc(drive, docs, parentId) {
  const d = await drive.files.create({ requestBody: { name: "SPIKE temp doc", mimeType: MIME.doc, parents: parentId ? [parentId] : undefined }, fields: "id", supportsAllDrives: true });
  await docs.documents.batchUpdate({ documentId: d.data.id, requestBody: { requests: [{ insertText: { location: { index: 1 }, text: "Welcome to {{event_name}} on {{date}} at {{venue}}." } }] } });
  return d.data.id;
}

main().catch((e) => {
  console.error("\nFATAL:", msg(e));
  if (/insufficient|scope|permission|forbidden/i.test(msg(e))) {
    console.error("→ Auth is missing Drive/Docs/Sheets/Slides scopes. See README (service account on the Shared Drive is the production path).");
  }
  process.exit(1);
});
