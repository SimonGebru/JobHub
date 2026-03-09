import type { SearchParams } from "@/types/job";

const STORAGE_KEY = "jobhub_search_history";
const MAX_ENTRIES = 15;

export interface SearchHistoryEntry {
  id: string;
  params: SearchParams;
  label: string;
  timestamp: string;
}

function buildLabel(params: SearchParams): string {
  const parts: string[] = [];
  if (params.q) parts.push(params.q);
  if (params.location) parts.push(params.location);
  if (params.remote) parts.push("Remote");
  return parts.length > 0 ? parts.join(" · ") : "Alla jobb";
}

export function getSearchHistory(): SearchHistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addSearchEntry(params: SearchParams): SearchHistoryEntry[] {
  const history = getSearchHistory();
  const label = buildLabel(params);

  // Deduplicate by label
  const filtered = history.filter((h) => h.label !== label);

  const entry: SearchHistoryEntry = {
    id: `sh-${Date.now()}`,
    params,
    label,
    timestamp: new Date().toISOString(),
  };

  const updated = [entry, ...filtered].slice(0, MAX_ENTRIES);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function clearSearchHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function removeSearchEntry(id: string): SearchHistoryEntry[] {
  const history = getSearchHistory().filter((h) => h.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  return history;
}