import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";

export const scoresRouter = Router();

const scoreSchema = z.object({
  teamId: z.string(),
  challengeId: z.string(),
  points: z.number().int().nonnegative(),
});

/** PUT /api/events/:id/scores — upsert one score cell (source of truth = DB). */
scoresRouter.put("/:id/scores", async (req, res, next) => {
  try {
    const { teamId, challengeId, points } = scoreSchema.parse(req.body);
    const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } });
    if (!challenge) return res.status(404).json({ error: "challenge_not_found" });
    const clamped = Math.min(points, challenge.maxPoints);
    const score = await prisma.score.upsert({
      where: { teamId_challengeId: { teamId, challengeId } },
      create: { eventId: req.params.id, teamId, challengeId, points: clamped },
      update: { points: clamped },
    });
    res.json(score);
  } catch (e) {
    next(e);
  }
});

/** GET /api/events/:id/leaderboard — ranked totals (points + bonus − penalty). */
scoresRouter.get("/:id/leaderboard", async (req, res, next) => {
  try {
    const teams = await prisma.team.findMany({
      where: { eventId: req.params.id, deletedAt: null },
      include: { scores: true },
    });
    const ranked = teams
      .map((t) => ({
        teamId: t.id,
        name: t.name,
        total: t.scores.reduce((s, x) => s + x.points, 0) + t.bonusPoints - t.penaltyPoints,
      }))
      .sort((a, b) => b.total - a.total);
    res.json(ranked);
  } catch (e) {
    next(e);
  }
});
