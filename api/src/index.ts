import "dotenv/config";
import express from "express";
import cors from "cors";
import { eventsRouter } from "./routes/events.js";
import { scoresRouter } from "./routes/scores.js";
import { deliverablesRouter } from "./routes/deliverables.js";
import { crewRouter } from "./routes/crew.js";
import { rotationRouter } from "./routes/rotation.js";

const app = express();
app.use(cors({ origin: process.env.WEB_ORIGIN ?? "http://localhost:5173" }));
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true, service: "eventops-api" }));

// Mirrors web/src/lib/api.ts — the front end swaps its mock bodies for these.
app.use("/api/events", eventsRouter);
app.use("/api/events", scoresRouter);
app.use("/api/events", deliverablesRouter);
app.use("/api/events", rotationRouter);
app.use("/api/crew", crewRouter);

const port = Number(process.env.PORT ?? 8080);
app.listen(port, () => console.log(`eventops-api listening on :${port}`));
