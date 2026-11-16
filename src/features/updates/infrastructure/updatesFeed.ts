import type { UpdateRelease } from "../domain/types";

/**
 * The version whose news the user opened last. A fixed key (no app version
 * in it), so it survives app updates.
 */
const SEEN_KEY = "terraink:news-seen";

/** Loads the release notes list; an empty list when it can't be read. */
export async function fetchUpdateReleases(url: string): Promise<UpdateRelease[]> {
  if (!url) return [];
  try {
    const response = await fetch(url);
    if (!response.ok) return [];
    const data: unknown = await response.json();
    return Array.isArray(data) ? (data as UpdateRelease[]) : [];
  } catch {
    return [];
  }
}

/** Turns a relative image path into one next to the notes file. */
export function resolveUpdateImage(image: string | null, updatesUrl: string): string | null {
  if (!image) return null;
  if (image.startsWith("http://") || image.startsWith("https://")) return image;
  try {
    return new URL(image, new URL(updatesUrl, window.location.origin)).toString();
  } catch {
    return image;
  }
}

export function loadNewsSeenVersion(): string | null {
  try {
    return window.localStorage.getItem(SEEN_KEY);
  } catch {
    return null;
  }
}

export function saveNewsSeenVersion(version: string): void {
  try {
    window.localStorage.setItem(SEEN_KEY, version);
  } catch {
    // Storage blocked (private mode): the dot may simply show again.
  }
}
