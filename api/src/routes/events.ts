import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { provisionEventFolder } from "../services/google/drive.js";

export const eventsRouter = Router();

/** GET /api/events — dashboard list. */
eventsRouter.get("/", async (_req, res, next) => {
  try {
    const events = await prisma.event.findMany({
      where: { deletedAt: null },
      orderBy: { date: "asc" },
    });
    res.json(events);
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
  date: z.string(), // ISO date
  pax: z.number().int().nonnegative().default(0),
  teams: z.number().int().nonnegative().default(0),
});

/** POST /api/events — create event + scaffold its Drive folder. */
eventsRouter.post("/", async (req, res, next) => {
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
      },
    });

    // Copy the master template folder into "EVENT OPS OS Events / <name>".
    // Implemented against the chosen ownership model after the Phase 0 spike.
    const folder = await provisionEventFolder(event.id, event.name).catch(() => null);
    if (folder) {
      await prisma.event.update({ where: { id: event.id }, data: { driveFolderId: folder.id } });
    }

    res.status(201).json(event);
  } catch (e) {
    next(e);
  }
});

/** GET /api/events/:id — single event summary. */
eventsRouter.get("/:id", async (req, res, next) => {
  try {
    const event = await prisma.event.findUnique({ where: { id: req.params.id } });
    if (!event) return res.status(404).json({ error: "not_found" });
    res.json(event);
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
        teams: { orderBy: { order: "asc" } },
        challenges: { orderBy: { order: "asc" } },
        scores: true,
        stations: { include: { crewAssignments: true } },
        flowBlocks: { include: { duties: true }, orderBy: { order: "asc" } },
        crewAssignments: { include: { crewMember: true } },
        procurement: true,
        packing: true,
        deliverables: true,
        rotationPlan: { include: { cells: true } },
        readinessItems: true,
      },
    });
    if (!event) return res.status(404).json({ error: "not_found" });
    res.json(event);
  } catch (e) {
    next(e);
  }
});
