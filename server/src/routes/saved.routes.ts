import { Router } from "express";
import {
  getSavedJobs,
  createSavedJob,
  updateSavedJob,
  deleteSavedJob,
} from "../controllers/saved.controller.js";

const router = Router();

router.get("/api/saved", getSavedJobs);
router.post("/api/saved", createSavedJob);
router.patch("/api/saved/:id", updateSavedJob);
router.delete("/api/saved/:id", deleteSavedJob);

export default router;