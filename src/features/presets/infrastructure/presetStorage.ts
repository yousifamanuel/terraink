import type { PosterPreset } from "@/features/presets/domain/types";

const STORAGE_KEY = "terraink:presets";
const MAX_PRESETS = 20;

function readRaw(): PosterPreset[] {
  try {
    const json = localStorage.getItem(STORAGE_KEY);
    if (!json) return [];
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeRaw(presets: PosterPreset[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
  } catch {
    // Ignore storage quota errors.
  }
}

export function loadPresets(): PosterPreset[] {
  return readRaw();
}

export function savePreset(preset: PosterPreset): PosterPreset[] {
  const existing = readRaw();
  const updated = [preset, ...existing.filter((p) => p.id !== preset.id)].slice(
    0,
    MAX_PRESETS,
  );
  writeRaw(updated);
  return updated;
}

export function deletePreset(id: string): PosterPreset[] {
  const updated = readRaw().filter((p) => p.id !== id);
  writeRaw(updated);
  return updated;
}
