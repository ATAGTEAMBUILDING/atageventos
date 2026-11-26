import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { provisionEventFolder } from "../services/google/drive.js";
import { toEventSummary, toWorkspace, type FullEvent } from "../lib/serialize.js";
import { requireRole } from "../middleware/auth.js";

export const eventsRouter = Router();

/** GET /api/events — dashboard list. */
eventsRouter.get("/", async (_req, res, next) => {
  try {
    const events = await prisma.event.findMany({ where: { deletedAt: null }, orderBy: { date: "asc" } });
    res.json(events.map(toEventSummary));
  } catch (e) {
    next(e);
  }
});

const createSchema = z.object({
  name: z.string().min(1),
  client: z.string().min(1),
  codename: z.string().optional(),
  venue: z.string().default("TBD"),
  city: z.string().default(""),
  date: z.string(),
  pax: z.number().int().nonnegative().default(0),
  teams: z.number().int().nonnegative().default(0),
});

/** POST /api/events — create event + scaffold its Drive folder. */
eventsRouter.post("/", requireRole("Admin", "Producer"), async (req, res, next) => {
  try {
    const input = createSchema.parse(req.body);
    const event = await prisma.event.create({
      data: {
        name: input.name,
        client: input.client,
        codename: input.codename,
        venue: input.venue,
        city: input.city,
        date: new Date(input.date),
        status: "Draft",
        pax: input.pax,
        teamsPlanned: input.teams,
        readiness: 12,
      },
    });

    // Best-effort Drive provisioning (no-op until the Google env is configured).
    const folder = await provisionEventFolder(event.id, event.name).catch(() => null);
    if (folder) await prisma.event.update({ where: { id: event.id }, data: { driveFolderId: folder.id } });

    res.status(201).json(toEventSummary(event));
  } catch (e) {
    next(e);
  }
});

/** GET /api/events/:id — single event summary. */
eventsRouter.get("/:id", async (req, res, next) => {
  try {
    const event = await prisma.event.findUnique({ where: { id: req.params.id } });
    if (!event) return res.status(404).json({ error: "not_found" });
    res.json(toEventSummary(event));
  } catch (e) {
    next(e);
  }
});

/** GET /api/events/:id/workspace — full payload the workspace renders. */
eventsRouter.get("/:id/workspace", async (req, res, next) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: req.params.id },
      include: {
        teams: { where: { deletedAt: null }, orderBy: { order: "asc" }, include: { scores: true } },
        challenges: { where: { deletedAt: null }, orderBy: { order: "asc" } },
        stations: { where: { deletedAt: null }, include: { crewAssignments: { include: { crewMember: true } } } },
        flowBlocks: { where: { deletedAt: null }, orderBy: { order: "asc" }, include: { duties: true } },
        crewAssignments: { where: { deletedAt: null }, include: { crewMember: true } },
        procurement: { where: { deletedAt: null } },
        packing: { where: { deletedAt: null } },
        rotationPlan: true,
      },
    });
    if (!event) return res.status(404).json({ error: "not_found" });
    res.json(toWorkspace(event as FullEvent));
  } catch (e) {
    next(e);
  }
});
