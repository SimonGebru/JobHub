import { Router } from "express";
import { getJobs } from "../controllers/jobs.controller.js";

const router = Router();

router.get("/api/jobs/search", getJobs);

export default router;