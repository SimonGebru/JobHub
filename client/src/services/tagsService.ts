import { USE_MOCK_API } from "@/config";
import { apiClient } from "@/lib/apiClient";

const STORAGE_KEY = "jobhub_job_tags";

export interface JobTags {
  [jobId: string]: string[];
}

function loadTags(): JobTags {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveTags(tags: JobTags): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tags));
}

export async function getJobTags(): Promise<JobTags> {
  if (USE_MOCK_API) return loadTags();
  // TODO(BACKEND): GET /api/tags
  return apiClient<JobTags>("/api/tags");
}

export async function setJobTags(jobId: string, tags: string[]): Promise<void> {
  if (USE_MOCK_API) {
    const all = loadTags();
    all[jobId] = tags;
    saveTags(all);
    return;
  }
  // TODO(BACKEND): PUT /api/tags/:jobId { tags }
  return apiClient<void>(`/api/tags/${jobId}`, { method: "PUT", body: { tags } });
}

export async function removeJobTags(jobId: string): Promise<void> {
  if (USE_MOCK_API) {
    const all = loadTags();
    delete all[jobId];
    saveTags(all);
    return;
  }
  // TODO(BACKEND): DELETE /api/tags/:jobId
  return apiClient<void>(`/api/tags/${jobId}`, { method: "DELETE" });
}