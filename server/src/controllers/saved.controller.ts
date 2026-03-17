import type { Request, Response } from "express";
import { SavedJob } from "../models/SavedJob.js";

export async function getSavedJobs(_req: Request, res: Response) {
  try {
    const savedJobs = await SavedJob.find().sort({ createdAt: -1 });
    res.json(savedJobs);
  } catch (error) {
    console.error("Failed to fetch saved jobs", error);
    res.status(500).json({ error: "Failed to fetch saved jobs" });
  }
}

export async function createSavedJob(req: Request, res: Response) {
  try {
    const { job } = req.body;

    if (!job) {
      return res.status(400).json({ error: "Job is required" });
    }

    const existingJob = await SavedJob.findOne({ jobId: job.id });

    if (existingJob) {
      return res.json(existingJob);
    }

    const savedJob = await SavedJob.create({
      jobId: job.id,
      source: job.source,
      sourceId: job.sourceId,
      title: job.title,
      company: job.company,
      locationText: job.locationText,
      remoteType: job.remoteType,
      publishedAt: job.publishedAt,
      applyUrl: job.applyUrl,
      jobUrl: job.jobUrl,
      descriptionText: job.descriptionText || "",
      seniority: job.seniority || "unknown",
      skills: job.skills || [],
      status: "saved",
      notes: "",
    });

    res.status(201).json(savedJob);
  } catch (error) {
    console.error("Failed to create saved job", error);
    res.status(500).json({ error: "Failed to create saved job" });
  }
}

export async function updateSavedJob(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const updatedJob = await SavedJob.findByIdAndUpdate(
      id,
      {
        ...(status !== undefined ? { status } : {}),
        ...(notes !== undefined ? { notes } : {}),
      },
      { new: true }
    );

    if (!updatedJob) {
      return res.status(404).json({ error: "Saved job not found" });
    }

    res.json(updatedJob);
  } catch (error) {
    console.error("Failed to update saved job", error);
    res.status(500).json({ error: "Failed to update saved job" });
  }
}

export async function deleteSavedJob(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const deletedJob = await SavedJob.findByIdAndDelete(id);

    if (!deletedJob) {
      return res.status(404).json({ error: "Saved job not found" });
    }

    res.status(204).send();
  } catch (error) {
    console.error("Failed to delete saved job", error);
    res.status(500).json({ error: "Failed to delete saved job" });
  }
}