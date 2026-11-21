import { useState, useSyncExternalStore } from "react";
import { APP_VERSION, UPDATES_URL } from "@/core/config";
import {
  fetchUpdateReleases,
  loadNewsSeenVersion,
  saveNewsSeenVersion,
  trackEvent,
} from "@/core/services";
import {
  isNewsUnread,
  pickVisibleReleases,
  type UpdateRelease,
} from "../domain/types";

export type NewsOpenSource = "nav" | "mobile_button" | "about";

// One shared "last opened" version, so the nav, the mobile button and
// About agree on the dot.
let seenVersion: string | null = loadNewsSeenVersion();
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function markSeen(version: string) {
  seenVersion = version;
  saveNewsSeenVersion(version);
  listeners.forEach((listener) => listener());
}

// Loaded once, on the first open; nothing is fetched before that.
let releasesPromise: Promise<UpdateRelease[]> | null = null;
function loadReleases(): Promise<UpdateRelease[]> {
  releasesPromise ??= fetchUpdateReleases(UPDATES_URL).then((releases) =>
    pickVisibleReleases(releases, APP_VERSION),
  );
  return releasesPromise;
}

/**
 * News: the dot shows until this app version's notes were opened. The notes
 * themselves are only loaded when the user opens News.
 */
export function useNews() {
  const seen = useSyncExternalStore(subscribe, () => seenVersion);
  const [releases, setReleases] = useState<UpdateRelease[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const open = async (source: NewsOpenSource): Promise<boolean> => {
    trackEvent("news_open", { source, app_release: APP_VERSION });
    markSeen(APP_VERSION);
    setIsLoading(true);
    const loaded = await loadReleases();
    setIsLoading(false);
    setReleases(loaded);
    return loaded.length > 0;
  };

  return {
    releases,
    isLoading,
    hasUnread: isNewsUnread(APP_VERSION, seen),
    open,
  };
}
