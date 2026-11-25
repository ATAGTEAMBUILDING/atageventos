/**
 * Google service-account auth (stub).
 *
 * Decision from the design doc: a dedicated service account is a member of the
 * "EVENT OPS OS Events" Shared Drive and performs all provisioning and
 * generation. Domain-wide delegation is used only if a file must be created as
 * a specific user. Confirmed by the Phase 0 spike.
 *
 * Scopes: drive, documents, spreadsheets, presentations.
 *
 * Implementation will use `google-auth-library` + `googleapis` with the key in
 * GOOGLE_SERVICE_ACCOUNT_KEY (base64 JSON).
 */
export async function getGoogleAuth(): Promise<unknown> {
  throw new Error("Not implemented: Google service-account auth (Phase 0 spike)");
}
