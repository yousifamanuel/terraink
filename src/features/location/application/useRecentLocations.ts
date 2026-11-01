import { useCallback, useEffect, useState } from "react";
import {
  addRecentLocation,
  clearRecentLocations,
  listRecentLocations,
  removeRecentLocation,
  trackEvent,
} from "@/core/services";
import type { Location, RecentLocation } from "../domain/types";

// Keeps every mounted search field in sync — DesktopLocationBar is mounted
// twice (desktop + mobile wrappers) and LocationSection is a third instance.
export const RECENT_LOCATIONS_CHANGED_EVENT = "terraink:recent-locations-changed";

function notifyChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(RECENT_LOCATIONS_CHANGED_EVENT));
}

/**
 * Records a picked location into the persisted search history.
 * Call only from selection choke points (suggestion picks) — never from
 * GPS lookups or raw typed queries.
 */
export function recordRecentLocation(location: Location): void {
  addRecentLocation(location);
  notifyChanged();
}

interface UseRecentLocationsReturn {
  recent: RecentLocation[];
  removeRecent: (id: string) => void;
  clearRecent: () => void;
}

export function useRecentLocations(): UseRecentLocationsReturn {
  const [recent, setRecent] = useState<RecentLocation[]>(() =>
    listRecentLocations(),
  );

  useEffect(() => {
    const refresh = () => setRecent(listRecentLocations());
    window.addEventListener(RECENT_LOCATIONS_CHANGED_EVENT, refresh);
    return () =>
      window.removeEventListener(RECENT_LOCATIONS_CHANGED_EVENT, refresh);
  }, []);

  const removeRecent = useCallback((id: string) => {
    setRecent(removeRecentLocation(id));
    notifyChanged();
    trackEvent("recent_location_removed");
  }, []);

  const clearRecent = useCallback(() => {
    clearRecentLocations();
    setRecent([]);
    notifyChanged();
    trackEvent("recent_history_cleared");
  }, []);

  return { recent, removeRecent, clearRecent };
}
