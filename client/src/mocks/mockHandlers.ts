import type { SearchParams, SearchResponse, SavedJob, Alert, SourceCompany, Job, Seniority } from "@/types/job";
import { mockJobs, mockSavedJobs, mockAlerts, mockSources } from "./mockData";

// In-memory state for mock CRUD
let savedJobs = [...mockSavedJobs];
let alerts = [...mockAlerts];
let sources = [...mockSources];
let idCounter = 100;

function delay(ms = 300): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export async function mockSearchJobs(
  params: SearchParams,
  seniorities?: Seniority[],
  skills?: string[],
): Promise<SearchResponse> {
  await delay(400);
  let filtered = [...mockJobs];

  if (params.q) {
    const q = params.q.toLowerCase();
    filtered = filtered.filter(
      (j) =>
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        (j.skills || []).some((s) => s.toLowerCase().includes(q))
    );
  }
  if (params.location) {
    const loc = params.location.toLowerCase();
    filtered = filtered.filter((j) =>
      j.locationText.toLowerCase().includes(loc)
    );
  }
  if (params.remote) {
    filtered = filtered.filter(
      (j) => j.remoteType === "remote" || j.remoteType === "hybrid"
    );
  }
  if (params.withinDays) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - params.withinDays);
    filtered = filtered.filter(
      (j) => j.publishedAt && new Date(j.publishedAt) >= cutoff
    );
  }
  if (params.sources && params.sources.length > 0) {
    filtered = filtered.filter((j) => params.sources!.includes(j.source));
  }
  if (seniorities && seniorities.length > 0) {
    filtered = filtered.filter((j) => j.seniority && seniorities.includes(j.seniority));
  }
  if (skills && skills.length > 0) {
    filtered = filtered.filter((j) =>
      j.skills && skills.some((s) => j.skills!.includes(s))
    );
  }

  const page = params.page || 1;
  const pageSize = params.pageSize || 20;
  const start = (page - 1) * pageSize;
  const paged = filtered.slice(start, start + pageSize);

  return {
    meta: {
      page,
      pageSize,
      totalApprox: filtered.length,
      sourcesUsed: params.sources || ["jobtech", "greenhouse", "lever"],
      cacheHit: false,
    },
    jobs: paged,
  };
}

export async function mockGetSaved(): Promise<SavedJob[]> {
  await delay(200);
  return [...savedJobs];
}

export async function mockCreateSaved(job: Job): Promise<SavedJob> {
  await delay(200);
  const saved: SavedJob = {
    _id: `saved-${++idCounter}`,
    userId: "local",
    jobId: job.id,
    jobSnapshot: job,
    status: "saved",
    notes: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  savedJobs.push(saved);
  return saved;
}

export async function mockUpdateSaved(
  id: string,
  update: Partial<Pick<SavedJob, "status" | "notes">>
): Promise<SavedJob> {
  await delay(200);
  const idx = savedJobs.findIndex((s) => s._id === id);
  if (idx === -1) throw new Error("Not found");
  savedJobs[idx] = {
    ...savedJobs[idx],
    ...update,
    updatedAt: new Date().toISOString(),
  };
  return savedJobs[idx];
}

export async function mockDeleteSaved(id: string): Promise<void> {
  await delay(200);
  savedJobs = savedJobs.filter((s) => s._id !== id);
}

export async function mockGetAlerts(): Promise<Alert[]> {
  await delay(200);
  return [...alerts];
}

export async function mockCreateAlert(
  data: Pick<Alert, "name" | "query" | "schedule">
): Promise<Alert> {
  await delay(200);
  const alert: Alert = {
    _id: `alert-${++idCounter}`,
    userId: "local",
    ...data,
    enabled: true,
    lastRunAt: null,
    createdAt: new Date().toISOString(),
  };
  alerts.push(alert);
  return alert;
}

export async function mockUpdateAlert(
  id: string,
  update: Partial<Pick<Alert, "name" | "schedule" | "enabled">>
): Promise<Alert> {
  await delay(200);
  const idx = alerts.findIndex((a) => a._id === id);
  if (idx === -1) throw new Error("Not found");
  alerts[idx] = { ...alerts[idx], ...update };
  return alerts[idx];
}

export async function mockDeleteAlert(id: string): Promise<void> {
  await delay(200);
  alerts = alerts.filter((a) => a._id !== id);
}

export async function mockGetSources(): Promise<SourceCompany[]> {
  await delay(200);
  return [...sources];
}

export async function mockCreateSource(
  data: Omit<SourceCompany, "_id" | "status">
): Promise<SourceCompany> {
  await delay(200);
  const source: SourceCompany = {
    _id: `src-${++idCounter}`,
    ...data,
    status: "unknown",
  };
  sources.push(source);
  return source;
}

export async function mockUpdateSource(
  id: string,
  update: Partial<SourceCompany>
): Promise<SourceCompany> {
  await delay(200);
  const idx = sources.findIndex((s) => s._id === id);
  if (idx === -1) throw new Error("Not found");
  sources[idx] = { ...sources[idx], ...update };
  return sources[idx];
}