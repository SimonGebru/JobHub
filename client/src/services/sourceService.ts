import { USE_MOCK_API } from "@/config";
import { apiClient } from "@/lib/apiClient";
import {
  mockGetSources,
  mockCreateSource,
  mockUpdateSource,
} from "@/mocks/mockHandlers";
import type { SourceCompany } from "@/types/job";

export async function getSources(): Promise<SourceCompany[]> {
  if (USE_MOCK_API) return mockGetSources();
  // TODO(BACKEND): GET /api/sources/companies
  return apiClient<SourceCompany[]>("/api/sources/companies");
}

export async function createSource(
  data: Omit<SourceCompany, "_id" | "status">
): Promise<SourceCompany> {
  if (USE_MOCK_API) return mockCreateSource(data);
  // TODO(BACKEND): POST /api/sources/companies
  return apiClient<SourceCompany>("/api/sources/companies", {
    method: "POST",
    body: data,
  });
}

export async function updateSource(
  id: string,
  update: Partial<SourceCompany>
): Promise<SourceCompany> {
  if (USE_MOCK_API) return mockUpdateSource(id, update);
  // TODO(BACKEND): PATCH /api/sources/companies/:id
  return apiClient<SourceCompany>(`/api/sources/companies/${id}`, {
    method: "PATCH",
    body: update,
  });
}