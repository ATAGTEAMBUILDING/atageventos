import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireRole } from "../middleware/auth.js";

export const scoresRouter = Router();
// Facilitators score on the day, so they can write scores (but not other things).
const canScore = requireRole("Admin", "Producer", "Facilitator");

const scoreSchema = z.object({
  teamId: z.string(),
  challengeKey: z.string(),
  points: z.number().int().nonnegative(),
});

/** PUT /api/events/:id/scores — upsert one score cell (source of truth = DB). */
scoresRouter.put("/:id/scores", canScore, async (req, res, next) => {
  try {
    const { teamId, challengeKey, points } = scoreSchema.parse(req.body);
    const challenge = await prisma.challenge.findFirst({ where: { eventId: req.params.id, key: challengeKey } });
    if (!challenge) return res.status(404).json({ error: "challenge_not_found" });
    const clamped = Math.min(points, challenge.maxPoints);
    const score = await prisma.score.upsert({
      where: { teamId_challengeId: { teamId, challengeId: challenge.id } },
      create: { eventId: req.params.id, teamId, challengeId: challenge.id, points: clamped },
      update: { points: clamped },
    });
    res.json({ teamId, challengeKey, points: score.points });
  } catch (e) {
    next(e);
  }
});

const adjSchema = z.object({ bonus: z.number().int().min(0), penalty: z.number().int().min(0) });

/** PUT /api/events/:id/teams/:teamId/adjustments — team bonus / penalty. */
scoresRouter.put("/:id/teams/:teamId/adjustments", canScore, async (req, res, next) => {
  try {
    const { bonus, penalty } = adjSchema.parse(req.body);
    const team = await prisma.team.update({
      where: { id: req.params.teamId },
      data: { bonusPoints: bonus, penaltyPoints: penalty },
    });
    res.json({ teamId: team.id, bonus: team.bonusPoints, penalty: team.penaltyPoints });
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
      .map((t) => ({ teamId: t.id, name: t.name, total: t.scores.reduce((s, x) => s + x.points, 0) + t.bonusPoints - t.penaltyPoints }))
      .sort((a, b) => b.total - a.total);
    res.json(ranked);
  } catch (e) {
    next(e);
  }
});
