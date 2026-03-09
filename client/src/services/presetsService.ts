import type { SearchPreset, SearchParams } from "@/types/job";

const STORAGE_KEY = "jobhub-presets";

let idCounter = Date.now();

function readAll(): SearchPreset[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeAll(presets: SearchPreset[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
}

// TODO(BACKEND): GET /api/presets
export async function getPresets(): Promise<SearchPreset[]> {
  return readAll();
}

// TODO(BACKEND): POST /api/presets { name, query }
export async function createPreset(name: string, query: SearchParams): Promise<SearchPreset> {
  const preset: SearchPreset = {
    id: `preset-${++idCounter}`,
    name,
    query,
    createdAt: new Date().toISOString(),
  };
  const all = readAll();
  all.push(preset);
  writeAll(all);
  return preset;
}

// TODO(BACKEND): PATCH /api/presets/:id { name }
export async function renamePreset(id: string, name: string): Promise<SearchPreset> {
  const all = readAll();
  const idx = all.findIndex((p) => p.id === id);
  if (idx === -1) throw new Error("Not found");
  all[idx] = { ...all[idx], name };
  writeAll(all);
  return all[idx];
}

// TODO(BACKEND): DELETE /api/presets/:id
export async function deletePreset(id: string): Promise<void> {
  const all = readAll().filter((p) => p.id !== id);
  writeAll(all);
}