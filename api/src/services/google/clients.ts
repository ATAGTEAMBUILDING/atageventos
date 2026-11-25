/**
 * Authenticated Google API clients (service account).
 *
 * Confirmed by the Phase 0 spike: production must use a service account, not
 * user ADC (Google is deprecating the Drive/Sheets scopes for the default
 * client id). The service account is a member of the "EVENT OPS OS Events"
 * Shared Drive; all provisioning and generation run as it.
 *
 * GOOGLE_SERVICE_ACCOUNT_KEY is the base64-encoded JSON key (see .env.example).
 */
import { google } from "googleapis";
import type { Auth } from "googleapis";

export const SCOPES = [
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/documents",
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/presentations",
];

let cached: Auth.GoogleAuth | null = null;

export function googleAuth(): Auth.GoogleAuth {
  if (cached) return cached;
  const b64 = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!b64) throw new Error("GOOGLE_SERVICE_ACCOUNT_KEY is not set (base64 JSON service-account key)");
  const credentials = JSON.parse(Buffer.from(b64, "base64").toString("utf8"));
  cached = new google.auth.GoogleAuth({ credentials, scopes: SCOPES });
  return cached;
}

export function googleClients() {
  const auth = googleAuth();
  return {
    drive: google.drive({ version: "v3", auth }),
    docs: google.docs({ version: "v1", auth }),
    sheets: google.sheets({ version: "v4", auth }),
    slides: google.slides({ version: "v1", auth }),
  };
}

export const ALL_DRIVES = { supportsAllDrives: true, includeItemsFromAllDrives: true } as const;
export const MIME = {
  folder: "application/vnd.google-apps.folder",
  doc: "application/vnd.google-apps.document",
  sheet: "application/vnd.google-apps.spreadsheet",
  slides: "application/vnd.google-apps.presentation",
} as const;
