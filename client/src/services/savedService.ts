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

  return apiClient<SavedJob[]>("/api/saved");
}

export async function saveJob(job: Job): Promise<SavedJob> {
  if (USE_MOCK_API) return mockCreateSaved(job);

  return apiClient<SavedJob>("/api/saved", {
    method: "POST",
    body: { job },
  });
}

export async function updateSavedJob(
  id: string,
  update: Partial<Pick<SavedJob, "status" | "notes">>
): Promise<SavedJob> {
  if (USE_MOCK_API) return mockUpdateSaved(id, update);

  return apiClient<SavedJob>(`/api/saved/${id}`, {
    method: "PATCH",
    body: update,
  });
}

export async function deleteSavedJob(id: string): Promise<void> {
  if (USE_MOCK_API) return mockDeleteSaved(id);

  return apiClient<void>(`/api/saved/${id}`, {
    method: "DELETE",
  });
}