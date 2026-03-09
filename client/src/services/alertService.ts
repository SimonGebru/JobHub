import { USE_MOCK_API } from "@/config";
import { apiClient } from "@/lib/apiClient";
import {
  mockGetAlerts,
  mockCreateAlert,
  mockUpdateAlert,
  mockDeleteAlert,
} from "@/mocks/mockHandlers";
import type { Alert } from "@/types/job";

export async function getAlerts(): Promise<Alert[]> {
  if (USE_MOCK_API) return mockGetAlerts();
  // TODO(BACKEND): GET /api/alerts
  return apiClient<Alert[]>("/api/alerts");
}

export async function createAlert(
  data: Pick<Alert, "name" | "query" | "schedule">
): Promise<Alert> {
  if (USE_MOCK_API) return mockCreateAlert(data);
  // TODO(BACKEND): POST /api/alerts { name, query, schedule }
  return apiClient<Alert>("/api/alerts", { method: "POST", body: data });
}

export async function updateAlert(
  id: string,
  update: Partial<Pick<Alert, "name" | "schedule" | "enabled">>
): Promise<Alert> {
  if (USE_MOCK_API) return mockUpdateAlert(id, update);
  // TODO(BACKEND): PATCH /api/alerts/:id
  return apiClient<Alert>(`/api/alerts/${id}`, { method: "PATCH", body: update });
}

export async function deleteAlert(id: string): Promise<void> {
  if (USE_MOCK_API) return mockDeleteAlert(id);
  // TODO(BACKEND): DELETE /api/alerts/:id
  return apiClient<void>(`/api/alerts/${id}`, { method: "DELETE" });
}