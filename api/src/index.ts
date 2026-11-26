import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { attachUser, requireAuth } from "./middleware/auth.js";
import { authRouter } from "./routes/auth.js";
import { eventsRouter } from "./routes/events.js";
import { scoresRouter } from "./routes/scores.js";
import { deliverablesRouter } from "./routes/deliverables.js";
import { crewRouter } from "./routes/crew.js";
import { rotationRouter } from "./routes/rotation.js";
import { resourcesRouter } from "./routes/resources.js";

const app = express();
app.use(cors({ origin: process.env.WEB_ORIGIN ?? "http://localhost:5173", credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use(attachUser);

app.get("/health", (_req, res) => res.json({ ok: true, service: "eventops-api" }));

// Auth routes are public (login / callback / me / logout).
app.use("/api/auth", authRouter);

// Everything else under /api requires a session.
app.use("/api", requireAuth);

app.use("/api/events", eventsRouter);
app.use("/api/events", scoresRouter);
app.use("/api/events", deliverablesRouter);
app.use("/api/events", rotationRouter);
app.use("/api/crew", crewRouter);
app.use("/api", resourcesRouter);

const port = Number(process.env.PORT ?? 8080);
app.listen(port, () => console.log(`eventops-api listening on :${port}`));
