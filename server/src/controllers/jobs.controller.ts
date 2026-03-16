import type { Request, Response } from "express";
import { searchJobs } from "../services/jobs.service.js";

export async function getJobs(req: Request, res: Response) {
  try {
    const result = await searchJobs({
      q: req.query.q as string | undefined,
      location: req.query.location as string | undefined,
      remote: req.query.remote as string | undefined,
      sources: req.query.sources as string | undefined,
      page: req.query.page as string | undefined,
      pageSize: req.query.pageSize as string | undefined,
    });

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
}