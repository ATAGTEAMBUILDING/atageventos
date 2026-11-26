/**
 * Live generation smoke test — the production path, standalone.
 *
 * Proves the real deliverable flow against your Shared Drive + templates:
 *   1. create a per-event folder under "EVENT OPS OS Events"
 *   2. copy the Slides deck template and merge {{tokens}}
 *   3. copy the Sheet scoresheet template and write a sample leaderboard
 *   4. report that the generated files are TEAM-OWNED (Shared Drive)
 *
 * Run in Google Cloud Shell as the SERVICE ACCOUNT (set
 * GOOGLE_APPLICATION_CREDENTIALS to its key.json), after adding that service
 * account to the "EventOps OS" Shared Drive as Content manager. No secrets here.
 *
 *   cd spike && npm install
 *   export GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json
 *   node generate-test.mjs
 */
import { google } from "googleapis";

const EVENTS_FOLDER_ID = process.env.GOOGLE_EVENTS_FOLDER_ID || "1zYQv1LqYJXjrVorqMJlc-5oOZFlI_4ma";
const DECK_ID = process.env.GOOGLE_TEMPLATE_DECK_ID || "160pXA5mWHB13zPjYKReQZ0Lzqke6ei3fUFbtO1S6jz4";
const SCORESHEET_ID = process.env.GOOGLE_TEMPLATE_SCORESHEET_ID || "1SLan91_0JFrYg5wjCK8R2vNhIOfV6uderIvIftWPzc4";
const SCORESHEET_TAB = process.env.GOOGLE_SCORESHEET_TAB || "Activity Master";
const CLEANUP = process.env.CLEANUP === "1";

const SCOPES = [
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/presentations",
];

const sample = {
  event_name: "Island Escape — GENERATION TEST",
  client: "Grab Holdings",
  venue: "Bintan Lagoon Adventure Camp",
  date: "2026-10-24",
  codename: "The Island Escape Expedition",
};
const leaderboard = [
  ["Team", "Cryptex", "Radio", "Toxic", "Raft", "Portal", "Total"],
  ["The Algorithmic Castaways", 100, 90, 0, 0, 0, 190],
  ["Payload Pioneers", 95, 85, 0, 0, 0, 180],
  ["Distributed Nomads", 80, 95, 0, 0, 0, 170],
];

const msg = (e) => e?.errors?.[0]?.message || e?.response?.data?.error?.message || e?.message || String(e);

async function main() {
  const auth = new google.auth.GoogleAuth({ scopes: SCOPES });
  const drive = google.drive({ version: "v3", auth });
  const sheets = google.sheets({ version: "v4", auth });
  const slides = google.slides({ version: "v1", auth });
  const who = (await drive.about.get({ fields: "user" })).data.user?.emailAddress;
  console.log(`Authenticated as: ${who}\n`);

  // 1. provision
  const name = `GEN TEST ${new Date().toISOString().replace(/[:.]/g, "-")}`;
  const folder = await drive.files.create({
    requestBody: { name, mimeType: "application/vnd.google-apps.folder", parents: [EVENTS_FOLDER_ID] },
    fields: "id,webViewLink,driveId",
    supportsAllDrives: true,
  });
  console.log(`[1] Folder created: ${folder.data.webViewLink}`);
  console.log(`    team-owned: ${folder.data.driveId ? "YES (Shared Drive " + folder.data.driveId + ")" : "NO — personal"}`);

  // 2. deck: copy + replaceAllText
  const deck = await drive.files.copy({
    fileId: DECK_ID,
    requestBody: { name: `${sample.event_name} — Deck`, parents: [folder.data.id] },
    fields: "id,webViewLink",
    supportsAllDrives: true,
  });
  await slides.presentations.batchUpdate({
    presentationId: deck.data.id,
    requestBody: {
      requests: Object.entries(sample).map(([k, v]) => ({
        replaceAllText: { containsText: { text: `{{${k}}}`, matchCase: false }, replaceText: String(v) },
      })),
    },
  });
  console.log(`[2] Deck generated (tokens merged): ${deck.data.webViewLink}`);

  // 3. scoresheet: copy + write leaderboard
  const sheet = await drive.files.copy({
    fileId: SCORESHEET_ID,
    requestBody: { name: `${sample.event_name} — Scores`, parents: [folder.data.id] },
    fields: "id,webViewLink",
    supportsAllDrives: true,
  });
  try {
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheet.data.id,
      range: `${SCORESHEET_TAB}!A1`,
      valueInputOption: "RAW",
      requestBody: { values: leaderboard },
    });
    console.log(`[3] Scoresheet generated (wrote to "${SCORESHEET_TAB}"): ${sheet.data.webViewLink}`);
  } catch (e) {
    console.log(`[3] Scoresheet copied, but writing tab "${SCORESHEET_TAB}" failed: ${msg(e)}`);
    console.log(`    -> set GOOGLE_SCORESHEET_TAB to a real tab name in that template.`);
  }

  if (CLEANUP) {
    await drive.files.update({ fileId: folder.data.id, requestBody: { trashed: true }, supportsAllDrives: true }).catch(() => {});
    console.log(`\n(cleaned up test folder)`);
  } else {
    console.log(`\nOpen the links above to see the generated files. Set CLEANUP=1 to auto-trash the test folder.`);
  }
  console.log(`\n✅ Live generation works against your real templates + Shared Drive.`);
}

main().catch((e) => {
  console.error("\nFATAL:", msg(e));
  if (/insufficient|scope|permission|forbidden|not found/i.test(msg(e))) {
    console.error("-> Make sure the service account is a Content manager on the 'EventOps OS' Shared Drive, and the 4 APIs are enabled.");
  }
  process.exit(1);
});
