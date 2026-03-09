import { USE_MOCK_API } from "@/config";
import { apiClient } from "@/lib/apiClient";
import {
  mockGetSaved,
  mockCreateSaved,
  mockUpdateSaved,
  mockDeleteSaved,
} from "@/mocks/mockHandlers";
import type { Job, SavedJob } from "@/types/job";

export async function getSavedJobs(): Promise<SavedJob[]> {
  if (USE_MOCK_API) return mockGetSaved();
  // TODO(BACKEND): GET /api/saved
  return apiClient<SavedJob[]>("/api/saved");
}

export async function saveJob(job: Job): Promise<SavedJob> {
  if (USE_MOCK_API) return mockCreateSaved(job);
  // TODO(BACKEND): POST /api/saved { job }
  return apiClient<SavedJob>("/api/saved", { method: "POST", body: { job } });
}

export async function updateSavedJob(
  id: string,
  update: Partial<Pick<SavedJob, "status" | "notes">>
): Promise<SavedJob> {
  if (USE_MOCK_API) return mockUpdateSaved(id, update);
  // TODO(BACKEND): PATCH /api/saved/:id { status?, notes? }
  return apiClient<SavedJob>(`/api/saved/${id}`, { method: "PATCH", body: update });
}

export async function deleteSavedJob(id: string): Promise<void> {
  if (USE_MOCK_API) return mockDeleteSaved(id);
  // TODO(BACKEND): DELETE /api/saved/:id
  return apiClient<void>(`/api/saved/${id}`, { method: "DELETE" });
}