import { Router } from "express";
import { notImplemented } from "../lib/http.js";
import { generateDeliverable } from "../services/google/generate.js";

export const deliverablesRouter = Router();

/**
 * POST /api/events/:id/deliverables/:kind/generate
 * kind = run-sheet | score-sheet | deck | name-tags | calendar
 * Copies the template, merges live event data, writes into the event's Drive
 * folder, and records the resulting file id + url on the Deliverable row.
 */
deliverablesRouter.post("/:id/deliverables/:kind/generate", async (req, res, next) => {
  try {
    const result = await generateDeliverable(req.params.id, req.params.kind);
    res.json(result);
  } catch (e) {
    // Until the Phase 0 spike lands the generation mechanism, this is a stub.
    if (e instanceof Error && e.message.startsWith("Not implemented")) {
      return notImplemented(res, e.message);
    }
    next(e);
  }
});
