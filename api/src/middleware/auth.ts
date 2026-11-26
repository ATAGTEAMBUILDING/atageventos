import type { Request, Response, NextFunction } from "express";
import type { UserRole } from "@prisma/client";
import { verifySession, COOKIE } from "../lib/auth.js";

/** Attach req.user from the session cookie (null if none / invalid). */
export function attachUser(req: Request, _res: Response, next: NextFunction) {
  const token = (req.cookies as Record<string, string> | undefined)?.[COOKIE];
  req.user = token ? verifySession(token) : null;
  next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).json({ error: "unauthenticated" });
  next();
}

/** Gate a route to specific roles (Viewer is read-only; never in a write list). */
export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: "unauthenticated" });
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: "forbidden", need: roles });
    next();
  };
}
