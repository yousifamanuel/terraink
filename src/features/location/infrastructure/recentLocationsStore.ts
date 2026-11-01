import type { Location, RecentLocation } from "../domain/types";
import type { IRecentLocationsStore } from "../domain/ports";

// Deliberately NOT prefixed with APP_VERSION (unlike localStorageCache):
// search history must survive app upgrades.
const STORAGE_KEY = "terraink:recent-locations";
const PAYLOAD_VERSION = 1;
const MAX_ENTRIES = 20;

interface StoredPayload {
  v: number;
  items: RecentLocation[];
}

function isValidEntry(value: unknown): value is RecentLocation {
  if (!value || typeof value !== "object") return false;
  const entry = value as Partial<RecentLocation>;
  return (
    typeof entry.id === "string" &&
    typeof entry.label === "string" &&
    Number.isFinite(entry.lat) &&
    Number.isFinite(entry.lon) &&
    Number.isFinite(entry.lastUsedAt)
  );
}

function coordKey(location: Pick<Location, "lat" | "lon">): string {
  return `${location.lat.toFixed(4)},${location.lon.toFixed(4)}`;
}

function readItems(): RecentLocation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const payload = JSON.parse(raw) as Partial<StoredPayload>;
    if (payload?.v !== PAYLOAD_VERSION || !Array.isArray(payload.items)) {
      return [];
    }
    return payload.items.filter(isValidEntry).slice(0, MAX_ENTRIES);
  } catch {
    return [];
  }
}

function writeItems(items: RecentLocation[]): void {
  if (typeof window === "undefined") return;
  try {
    const payload: StoredPayload = { v: PAYLOAD_VERSION, items };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Quota exceeded / private mode — history is best-effort.
  }
}

export function createRecentLocationsStore(): IRecentLocationsStore {
  return {
    list() {
      return readItems();
    },
    add(location) {
      const entry: RecentLocation = { ...location, lastUsedAt: Date.now() };
      const items = readItems().filter(
        (item) => item.id !== location.id && coordKey(item) !== coordKey(location),
      );
      items.unshift(entry);
      const capped = items.slice(0, MAX_ENTRIES);
      writeItems(capped);
      return capped;
    },
    remove(id) {
      const items = readItems().filter((item) => item.id !== id);
      writeItems(items);
      return items;
    },
    clear() {
      if (typeof window === "undefined") return;
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        // Best-effort.
      }
    },
  };
}
