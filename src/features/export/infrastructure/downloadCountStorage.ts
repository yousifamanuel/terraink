/**
 * All-time number of downloads in this browser. A fixed key (no app version
 * in it), so the number survives app updates.
 */
const STORAGE_KEY = "terraink:download-count";

export function loadAllTimeDownloadCount(): number | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) return null;
    const value = Number(raw);
    return Number.isFinite(value) && value >= 0 ? Math.floor(value) : null;
  } catch {
    return null;
  }
}

export function saveAllTimeDownloadCount(count: number): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, String(count));
  } catch {
    // Storage blocked (private mode): the count starts over next visit.
  }
}
