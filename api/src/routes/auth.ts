import { Router } from "express";
import { google } from "googleapis";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { signSession, cookieOpts, COOKIE, type SessionUser } from "../lib/auth.js";
import type { UserRole } from "@prisma/client";

export const authRouter = Router();

const WEB = process.env.WEB_ORIGIN || "http://localhost:5173";
const DOMAIN = process.env.ALLOWED_EMAIL_DOMAIN || "myatag.com";
const REDIRECT = process.env.OAUTH_REDIRECT_URL || "http://localhost:8080/api/auth/google/callback";

export const oauthConfigured = () => !!(process.env.GOOGLE_OAUTH_CLIENT_ID && process.env.GOOGLE_OAUTH_CLIENT_SECRET);
const devLoginAllowed = () => !oauthConfigured() || process.env.ENABLE_DEV_LOGIN === "1";

function oauthClient() {
  return new google.auth.OAuth2(process.env.GOOGLE_OAUTH_CLIENT_ID, process.env.GOOGLE_OAUTH_CLIENT_SECRET, REDIRECT);
}

/** Find-or-create a user, then return the session shape. First user = Admin. */
async function upsertUser(email: string, name: string, role?: UserRole): Promise<SessionUser> {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const u = existing.name !== name ? await prisma.user.update({ where: { email }, data: { name } }) : existing;
    return { id: u.id, email: u.email, name: u.name, role: u.role };
  }
  const count = await prisma.user.count();
  const assigned: UserRole = role ?? (count === 0 ? "Admin" : "Producer");
  const u = await prisma.user.create({ data: { email, name, role: assigned } });
  return { id: u.id, email: u.email, name: u.name, role: u.role };
}

/** GET /api/auth/google — begin the OAuth consent flow. */
authRouter.get("/google", (_req, res) => {
  if (!oauthConfigured()) return res.status(503).json({ error: "oauth_not_configured" });
  const url = oauthClient().generateAuthUrl({
    access_type: "offline",
    prompt: "select_account",
    hd: DOMAIN,
    scope: ["openid", "email", "profile"],
  });
  res.redirect(url);
});

/** GET /api/auth/google/callback — exchange the code, set the session. */
authRouter.get("/google/callback", async (req, res) => {
  try {
    const code = String(req.query.code ?? "");
    const client = oauthClient();
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);
    const { data } = await google.oauth2({ version: "v2", auth: client }).userinfo.get();
    const email = data.email ?? "";
    if (!email.toLowerCase().endsWith("@" + DOMAIN)) return res.redirect(`${WEB}/login?error=domain`);
    const user = await upsertUser(email, data.name ?? email);
    res.cookie(COOKIE, signSession(user), cookieOpts);
    res.redirect(WEB);
  } catch {
    res.redirect(`${WEB}/login?error=oauth`);
  }
});

const devSchema = z.object({
  email: z.string().email().optional(),
  role: z.enum(["Admin", "Producer", "Facilitator", "Viewer"]).optional(),
});

/** POST /api/auth/dev-login — local only; disabled once OAuth is configured. */
authRouter.post("/dev-login", async (req, res, next) => {
  try {
    if (!devLoginAllowed()) return res.status(403).json({ error: "dev_login_disabled" });
    const { email, role } = devSchema.parse(req.body);
    const addr = email ?? `${(role ?? "producer").toLowerCase()}@${DOMAIN}`;
    const user = await upsertUser(addr, (role ?? "Producer") + " (dev)", role);
    res.cookie(COOKIE, signSession(user), cookieOpts);
    res.json(user);
  } catch (e) {
    next(e);
  }
});

/** GET /api/auth/me — current session, plus whether OAuth / dev-login are available. */
authRouter.get("/me", (req, res) => {
  if (!req.user) return res.status(401).json({ error: "unauthenticated", oauth: oauthConfigured(), devLogin: devLoginAllowed() });
  res.json(req.user);
});

/** POST /api/auth/logout */
authRouter.post("/logout", (_req, res) => {
  res.clearCookie(COOKIE, { ...cookieOpts, maxAge: undefined });
  res.json({ ok: true });
});
