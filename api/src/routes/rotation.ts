import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { solveRotation } from "../services/rotation.js";
import { requireRole } from "../middleware/auth.js";

export const rotationRouter = Router();

/** POST /api/events/:id/rotation/generate — solve and persist the rotation plan. */
rotationRouter.post("/:id/rotation/generate", requireRole("Admin", "Producer"), async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const [teams, stations, event] = await Promise.all([
      prisma.team.findMany({ where: { eventId, deletedAt: null }, orderBy: { order: "asc" } }),
      prisma.station.findMany({ where: { eventId, deletedAt: null } }),
      prisma.event.findUnique({ where: { id: eventId } }),
    ]);
    if (!event) return res.status(404).json({ error: "not_found" });

    const { rounds, cells } = solveRotation({
      teamIds: teams.map((t) => t.id),
      stationIds: stations.map((s) => s.id),
    });

    const plan = await prisma.rotationPlan.upsert({
      where: { eventId },
      create: { eventId, rounds, roundMinutes: 24, includesRest: true },
      update: { rounds },
    });
    await prisma.rotationCell.deleteMany({ where: { rotationPlanId: plan.id } });
    await prisma.rotationCell.createMany({
      data: cells.map((c) => ({ rotationPlanId: plan.id, teamId: c.teamId, round: c.round, stationId: c.stationId })),
    });

    res.json({ rounds, cells });
  } catch (e) {
    next(e);
  }
});
