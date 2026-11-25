import type { Response } from "express";

/** Marks a handler that still needs implementation (post Phase 0 spike). */
export class NotImplemented extends Error {
  constructor(what: string) {
    super(`Not implemented: ${what}`);
  }
}

export function notImplemented(res: Response, what: string) {
  res.status(501).json({ error: "not_implemented", detail: what });
}
