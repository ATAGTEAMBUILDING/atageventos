import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import type { ProcurementStatus } from "@prisma/client";

export const resourcesRouter = Router();

/** PATCH /api/packing/:itemId — toggle a packing item. */
resourcesRouter.patch("/packing/:itemId", async (req, res, next) => {
  try {
    const { done } = z.object({ done: z.boolean() }).parse(req.body);
    const item = await prisma.packingItem.update({ where: { id: req.params.itemId }, data: { done } });
    res.json({ id: item.id, done: item.done });
  } catch (e) {
    next(e);
  }
});

const webToDbStatus: Record<string, ProcurementStatus> = {
  "To Order": "ToOrder",
  "Ordered (In Transit)": "Ordered",
  "Received on Site": "Received",
};

/** PATCH /api/procurement/:itemId — change fulfilment status. */
resourcesRouter.patch("/procurement/:itemId", async (req, res, next) => {
  try {
    const { status } = z.object({ status: z.string() }).parse(req.body);
    const dbStatus = webToDbStatus[status];
    if (!dbStatus) return res.status(400).json({ error: "bad_status" });
    const item = await prisma.procurementItem.update({ where: { id: req.params.itemId }, data: { status: dbStatus } });
    res.json({ id: item.id, status });
  } catch (e) {
    next(e);
  }
});

/** PATCH /api/flow/:blockId — mark a flow step complete / incomplete. */
resourcesRouter.patch("/flow/:blockId", async (req, res, next) => {
  try {
    const { completed } = z.object({ completed: z.boolean() }).parse(req.body);
    const block = await prisma.flowBlock.update({ where: { id: req.params.blockId }, data: { completed } });
    res.json({ id: block.id, completed: block.completed });
  } catch (e) {
    next(e);
  }
});

/** PUT /api/stations/:stationId/mapping — replace producer + facilitators (by name). */
resourcesRouter.put("/stations/:stationId/mapping", async (req, res, next) => {
  try {
    const { producer, facilitators } = z
      .object({ producer: z.string().nullable(), facilitators: z.array(z.string()) })
      .parse(req.body);
    const station = await prisma.station.findUnique({ where: { id: req.params.stationId } });
    if (!station) return res.status(404).json({ error: "not_found" });

    async function ensureMember(name: string, type: "FullTime" | "PartTime") {
      const existing = await prisma.crewMember.findFirst({ where: { name, deletedAt: null } });
      if (existing) return existing.id;
      const created = await prisma.crewMember.create({ data: { name, type } });
      return created.id;
    }

    await prisma.crewAssignment.deleteMany({ where: { stationId: station.id } });
    if (producer && producer !== "—") {
      await prisma.crewAssignment.create({
        data: { eventId: station.eventId, stationId: station.id, crewMemberId: await ensureMember(producer, "FullTime"), roleTitle: "Station Producer", type: "FullTime", status: "Confirmed", source: "manual" },
      });
    }
    for (const f of facilitators) {
      await prisma.crewAssignment.create({
        data: { eventId: station.eventId, stationId: station.id, crewMemberId: await ensureMember(f, "PartTime"), roleTitle: "Station Facilitator", type: "PartTime", status: "Confirmed", source: "manual" },
      });
    }
    res.json({ stationId: station.id, producer: producer ?? "—", facilitators });
  } catch (e) {
    next(e);
  }
});
