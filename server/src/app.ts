import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import healthRoutes from "./routes/health.routes.js";
import jobsRoutes from "./routes/jobs.routes.js";

const app = express();

app.use(
  cors({
    origin: env.clientUrl,
  })
);

app.use(express.json());

app.use(healthRoutes);
app.use(jobsRoutes);

export default app;