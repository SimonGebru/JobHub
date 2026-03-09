import { USE_MOCK_API } from "@/config";
import { apiClient } from "@/lib/apiClient";
import { mockSearchJobs } from "@/mocks/mockHandlers";
import type { SearchParams, SearchResponse, Seniority } from "@/types/job";

export async function searchJobs(
  params: SearchParams,
  seniorities?: Seniority[],
  skills?: string[],
): Promise<SearchResponse> {
  if (USE_MOCK_API) {
    return mockSearchJobs(params, seniorities, skills);
  }

  // TODO(BACKEND): GET /api/jobs/search with query params
  return apiClient<SearchResponse>("/api/jobs/search", {
    params: {
      q: params.q,
      location: params.location,
      remote: params.remote,
      withinDays: params.withinDays,
      sources: params.sources?.join(","),
      seniorities: seniorities?.join(","),
      skills: skills?.join(","),
      page: params.page,
      pageSize: params.pageSize,
    },
  });
}