/** Favorite theme ids (built-in or saved). Fixed key: survives app updates. */
const STORAGE_KEY = "terraink:favorite-themes";

export function loadFavoriteThemeIds(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : [];
  } catch {
    return [];
  }
}

export function saveFavoriteThemeIds(ids: string[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Storage blocked (private mode): favorites last for this visit only.
  }
}
