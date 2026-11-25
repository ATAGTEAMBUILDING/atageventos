/**
 * EventOps OS — Phase 0 spike.
 *
 * Proves, against the REAL "EVENT OPS OS Events" template, that a Google
 * identity can: provision a per-event folder, copy the templates, merge live
 * data into a Doc / Sheet / Slides, set sharing, and that files end up
 * team-owned (Shared Drive). Throwaway code whose output is DECISIONS.
 *
 * Run it in Google Cloud Shell or any machine where the service account lives.
 * See README.md. Nothing here is secret — auth comes from ADC /
 * GOOGLE_APPLICATION_CREDENTIALS, never from this file.
 */
import { google } from "googleapis";

// ---- config (env, with the known template folder as default) ----------------
const TEMPLATE_FOLDER_ID = process.env.TEMPLATE_FOLDER_ID || "1fvBGdH5kUBmoKAK4vNZImT2N5D-iVi6C";
const PARENT_FOLDER_ID = process.env.PARENT_FOLDER_ID || ""; // where to create the test event folder; default = template's parent
const OPS_GROUP_EMAIL = process.env.OPS_GROUP_EMAIL || ""; // optional: test Content-manager share
const TEST_VIEWER_EMAIL = process.env.TEST_VIEWER_EMAIL || ""; // optional: test viewer share
const CLEANUP = process.env.CLEANUP === "1"; // trash the test folder at the end

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
  const copied = { doc: null, sheet: null, slides: null };

  // ---- Task 1: Auth + list template folder ---------------------------------
  try {
    const me = await drive.about.get({ fields: "user" });
    const folder = await drive.files.get({
      fileId: TEMPLATE_FOLDER_ID,
      fields: "id,name,driveId,mimeType",
      supportsAllDrives: true,
    });
    driveId = folder.data.driveId || null;
    const children = await drive.files.list({
      q: `'${TEMPLATE_FOLDER_ID}' in parents and trashed=false`,
      fields: "files(id,name,mimeType)",
      pageSize: 100,
      ...ALL_DRIVES,
    });
    const items = children.data.files || [];
    record(
      "1. Auth + list template folder",
      "PASS",
      `as ${me.data.user?.emailAddress}; "${folder.data.name}" ` +
        `${driveId ? `on Shared Drive ${driveId}` : "on My Drive"}; ${items.length} items: ` +
        items.map((f) => `${f.name} [${short(f.mimeType)}]`).join(", ")
    );
    global.__children = items;
  } catch (e) {
    record("1. Auth + list template folder", "FAIL", msg(e));
    return finish(); // nothing else can run
  }

  // ---- Task 2: Provision — copy template into a new event folder -----------
  try {
    const parent = PARENT_FOLDER_ID || (await parentOf(drive, TEMPLATE_FOLDER_ID)) || driveId;
    const name = `TEST EVENT ${new Date().toISOString().replace(/[:.]/g, "-")}`;
    const folder = await drive.files.create({
      requestBody: { name, mimeType: "application/vnd.google-apps.folder", parents: parent ? [parent] : undefined },
      fields: "id,webViewLink,driveId",
      supportsAllDrives: true,
    });
    newFolderId = folder.data.id;

    // subfolders Decks/ Sheets/ Docs/
    for (const sub of ["Decks", "Sheets", "Docs"]) {
      await drive.files.create({
        requestBody: { name: sub, mimeType: "application/vnd.google-apps.folder", parents: [newFolderId] },
        fields: "id",
        supportsAllDrives: true,
      });
    }

    const toCopy = (global.__children || []).filter((f) => f.mimeType !== "application/vnd.google-apps.folder");
    for (const f of toCopy) {
      const c = await drive.files.copy({
        fileId: f.id,
        requestBody: { name: f.name.replace(/template/i, "Island Escape"), parents: [newFolderId] },
        fields: "id,name,mimeType",
        supportsAllDrives: true,
      });
      if (c.data.mimeType === "application/vnd.google-apps.document") copied.doc ??= c.data.id;
      if (c.data.mimeType === "application/vnd.google-apps.spreadsheet") copied.sheet ??= c.data.id;
      if (c.data.mimeType === "application/vnd.google-apps.presentation") copied.slides ??= c.data.id;
    }
    record(
      "2. Provision event folder",
      "PASS",
      `created "${name}" (${folder.data.webViewLink}); copied ${toCopy.length} files ` +
        `(doc:${!!copied.doc} sheet:${!!copied.sheet} slides:${!!copied.slides})`
    );
  } catch (e) {
    record("2. Provision event folder", "FAIL", msg(e));
  }

  // ---- Task 3: Docs merge (replaceAllText on {{tokens}}) --------------------
  try {
    const docId = copied.doc || (await makeTempDoc(drive, docs, newFolderId));
    const reqs = Object.entries(sample).map(([k, v]) => ({
      replaceAllText: { containsText: { text: `{{${k}}}`, matchCase: false }, replaceText: v },
    }));
    const r = await docs.documents.batchUpdate({ documentId: docId, requestBody: { requests: reqs } });
    const replaced = (r.data.replies || []).reduce((n, x) => n + (x.replaceAllText?.occurrencesChanged || 0), 0);
    const after = await docs.documents.get({ documentId: docId });
    const leftover = JSON.stringify(after.data).match(/\{\{[a-z_]+\}\}/gi) || [];
    record(
      "3. Docs merge",
      leftover.length ? "FAIL" : "PASS",
      `replaced ${replaced} token occurrence(s); ${leftover.length} token(s) left ${leftover.join(",")}`
    );
  } catch (e) {
    record("3. Docs merge", copied.doc ? "FAIL" : "SKIP", msg(e));
  }

  // ---- Task 4: Sheets write named range + read back ------------------------
  try {
    if (!copied.sheet) throw new Error("no Google Sheet in template to test");
    const meta = await sheets.spreadsheets.get({ spreadsheetId: copied.sheet, fields: "namedRanges,sheets.properties" });
    const named = meta.data.namedRanges?.[0]?.name;
    const range = named || "A1";
    const values = [
      ["Team", "Cryptex", "Radio"],
      ["The Algorithmic Castaways", 100, 90],
      ["Payload Pioneers", 95, 85],
    ];
    await sheets.spreadsheets.values.update({
      spreadsheetId: copied.sheet,
      range,
      valueInputOption: "RAW",
      requestBody: { values },
    });
    const back = await sheets.spreadsheets.values.get({ spreadsheetId: copied.sheet, range });
    record(
      "4. Sheets write + read back",
      "PASS",
      `wrote to ${named ? `named range "${named}"` : "A1 (no named range found)"}; read back ${back.data.values?.length || 0} rows`
    );
  } catch (e) {
    record("4. Sheets write + read back", copied.sheet ? "FAIL" : "SKIP", msg(e));
  }

  // ---- Task 5: Slides duplicate + replaceAllText ---------------------------
  try {
    if (!copied.slides) throw new Error("no Google Slides deck in template to test");
    const deck = await slides.presentations.get({ presentationId: copied.slides, fields: "slides.objectId" });
    const firstSlide = deck.data.slides?.[0]?.objectId;
    const reqs = [
      ...(firstSlide ? [{ duplicateObject: { objectId: firstSlide } }] : []),
      ...Object.entries(sample).map(([k, v]) => ({
        replaceAllText: { containsText: { text: `{{${k}}}`, matchCase: false }, replaceText: v },
      })),
    ];
    const r = await slides.presentations.batchUpdate({ presentationId: copied.slides, requestBody: { requests: reqs } });
    record(
      "5. Slides duplicate + merge",
      "PASS",
      `applied ${r.data.replies?.length || 0} request(s): duplicated a slide + replaced tokens`
    );
  } catch (e) {
    record("5. Slides duplicate + merge", copied.slides ? "FAIL" : "SKIP", msg(e));
  }

  // ---- Task 6: Sharing ------------------------------------------------------
  try {
    if (!newFolderId) throw new Error("no event folder to share");
    const grants = [];
    if (OPS_GROUP_EMAIL) {
      await drive.permissions.create({
        fileId: newFolderId,
        requestBody: { type: "group", role: driveId ? "fileOrganizer" : "writer", emailAddress: OPS_GROUP_EMAIL },
        sendNotificationEmail: false,
        supportsAllDrives: true,
      });
      grants.push(`${OPS_GROUP_EMAIL} as ${driveId ? "Content manager" : "writer"}`);
    }
    if (TEST_VIEWER_EMAIL) {
      await drive.permissions.create({
        fileId: newFolderId,
        requestBody: { type: "user", role: "reader", emailAddress: TEST_VIEWER_EMAIL },
        sendNotificationEmail: false,
        supportsAllDrives: true,
      });
      grants.push(`${TEST_VIEWER_EMAIL} as viewer`);
    }
    const perms = await drive.permissions.list({
      fileId: newFolderId,
      fields: "permissions(type,role,emailAddress)",
      supportsAllDrives: true,
    });
    record(
      "6. Sharing",
      grants.length ? "PASS" : "SKIP",
      grants.length
        ? `granted ${grants.join("; ")}; folder now has ${perms.data.permissions?.length || 0} permission(s)`
        : "set OPS_GROUP_EMAIL and/or TEST_VIEWER_EMAIL to test sharing"
    );
  } catch (e) {
    record("6. Sharing", "FAIL", msg(e));
  }

  // ---- Task 7: Ownership ----------------------------------------------------
  try {
    if (!newFolderId) throw new Error("no event folder to inspect");
    const info = await drive.files.get({
      fileId: newFolderId,
      fields: "id,name,driveId,owners(emailAddress),capabilities(canEdit,canShare)",
      supportsAllDrives: true,
    });
    const onSharedDrive = !!info.data.driveId;
    record(
      "7. Ownership check",
      "PASS",
      onSharedDrive
        ? `TEAM-OWNED: files live on Shared Drive ${info.data.driveId}, no individual owner — survives staff departures (recommended model confirmed)`
        : `PERSONAL-OWNED: owner is ${info.data.owners?.map((o) => o.emailAddress).join(",")} — files would orphan if this identity is removed; reconsider vs. Shared Drive`
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
  console.log(`\n  ${pass}/${results.length} passed. Capture these decisions in the design doc:`);
  console.log("  1) Generation mechanism per file type (Google API vs. Apps Script)");
  console.log("  2) Ownership model (see Task 7)");
  console.log("  3) Token / named-range conventions that worked");
  console.log("  4) Any quota or permission surprises above");
  process.exit(results.some((r) => r.status === "FAIL") ? 1 : 0);
}

// ---- helpers ----------------------------------------------------------------
const short = (m) => (m || "").replace("application/vnd.google-apps.", "");
const msg = (e) => (e?.errors?.[0]?.message || e?.response?.data?.error?.message || e?.message || String(e));
async function parentOf(drive, fileId) {
  const r = await drive.files.get({ fileId, fields: "parents", supportsAllDrives: true });
  return r.data.parents?.[0] || null;
}
async function makeTempDoc(drive, docs, parentId) {
  const d = await drive.files.create({
    requestBody: { name: "SPIKE temp doc", mimeType: "application/vnd.google-apps.document", parents: parentId ? [parentId] : undefined },
    fields: "id",
    supportsAllDrives: true,
  });
  await docs.documents.batchUpdate({
    documentId: d.data.id,
    requestBody: { requests: [{ insertText: { location: { index: 1 }, text: "Welcome to {{event_name}} on {{date}} at {{venue}}." } }] },
  });
  return d.data.id;
}

main().catch((e) => {
  console.error("\nFATAL:", msg(e));
  if (/insufficient|scope|permission|forbidden/i.test(msg(e))) {
    console.error("→ Auth is missing Drive/Docs/Sheets/Slides scopes. See README (service account on the Shared Drive, or ADC with --scopes).");
  }
  process.exit(1);
});
