const STORAGE_KEY = "terraink:hints-seen";

/** Ids of the feature hints this visitor has already seen. */
export function loadSeenHints(): string[] {
  try {
    const data: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(data) ? data.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

export function saveSeenHints(ids: string[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Storage blocked (private mode): the hints show again next visit.
  }
}
