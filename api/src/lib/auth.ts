/**
 * Session auth — a signed JWT in an httpOnly cookie. Issued after Google
 * Workspace OAuth (ADR-004), or via dev-login in local development.
 */
import jwt from "jsonwebtoken";
import type { UserRole } from "@prisma/client";

export const COOKIE = "eventops_session";
const SECRET = process.env.SESSION_SECRET || "dev-insecure-secret-change-me";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export function signSession(u: SessionUser): string {
  return jwt.sign(u, SECRET, { expiresIn: "7d" });
}

export function verifySession(token: string): SessionUser | null {
  try {
    const d = jwt.verify(token, SECRET) as jwt.JwtPayload & SessionUser;
    return { id: d.id, email: d.email, name: d.name, role: d.role };
  } catch {
    return null;
  }
}

export const cookieOpts = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  maxAge: 7 * 24 * 3600 * 1000,
  path: "/",
};
