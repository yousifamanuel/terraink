import type { SavedTheme } from "../domain/types";

const STORAGE_KEY = "terraink:saved-themes";

function isBrowserStorageAvailable(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function isSavedTheme(value: unknown): value is SavedTheme {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.name === "string" &&
    typeof candidate.savedAt === "string" &&
    typeof candidate.colors === "object" &&
    candidate.colors !== null
  );
}

function normalizeSavedTheme(theme: SavedTheme): SavedTheme {
  return {
    ...theme,
    description: typeof theme.description === "string" ? theme.description : "",
  };
}

export function loadSavedThemes(): SavedTheme[] {
  if (!isBrowserStorageAvailable()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isSavedTheme).map(normalizeSavedTheme);
  } catch {
    return [];
  }
}

export function saveSavedThemes(themes: SavedTheme[]): void {
  if (!isBrowserStorageAvailable()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(themes));
  } catch {
    // Ignore quota / serialization errors.
  }
}
