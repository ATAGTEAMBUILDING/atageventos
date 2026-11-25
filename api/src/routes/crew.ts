import { Router } from "express";
import { notImplemented } from "../lib/http.js";
import { listConfirmedCrew, postOpenRole, nudgeCrew } from "../services/facilitatorApp.js";

export const crewRouter = Router();

/** GET /api/crew?eventId=... — confirmed assignments read from the Facilitator App. */
crewRouter.get("/", async (req, res, next) => {
  try {
    const eventId = String(req.query.eventId ?? "");
    const crew = await listConfirmedCrew(eventId);
    res.json(crew);
  } catch (e) {
    if (e instanceof Error && e.message.startsWith("Not implemented")) {
      return notImplemented(res, e.message);
    }
    next(e);
  }
});

/** POST /api/crew/post-role — publish an open role back to the Facilitator App. */
crewRouter.post("/post-role", async (req, res, next) => {
  try {
    const result = await postOpenRole(req.body);
    res.json(result);
  } catch (e) {
    if (e instanceof Error && e.message.startsWith("Not implemented")) {
      return notImplemented(res, e.message);
    }
    next(e);
  }
});

/** POST /api/crew/:id/nudge — remind a pending crew member. */
crewRouter.post("/:id/nudge", async (req, res, next) => {
  try {
    res.json(await nudgeCrew(req.params.id));
  } catch (e) {
    if (e instanceof Error && e.message.startsWith("Not implemented")) {
      return notImplemented(res, e.message);
    }
    next(e);
  }
});
