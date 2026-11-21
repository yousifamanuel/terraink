import { compareVersions, isVersionWithin } from "@/shared/utils/version";

export { compareVersions };

export type UpdateCategory =
  | "new"
  | "fixed"
  | "improved"
  | "info"
  | "community"
  | "docs"
  | "roadmap"
  | "removed"
  | "security"
  | "breaking"
  | "major"
  | "perf"
  | "core";

export interface UpdatePoint {
  type: UpdateCategory;
  text: string;
}

export interface UpdateStep {
  title: string;
  image: string | null;
  points: UpdatePoint[];
}

export interface UpdateRelease {
  version: string;
  date: string;
  /** Optional wide picture at the top of the first page. */
  image?: string;
  /**
   * Keeps these notes in News for later versions too, up to this one
   * ("0.5.x" = all of 0.5). Without it they show only until newer notes exist.
   */
  until?: string;
  labels?: { summaryTitle?: string; detailsTitle?: string };
  summary?: { title?: string; points: UpdatePoint[] };
  steps: UpdateStep[];
}


/**
 * The notes News shows, newest first: the newest release that is not ahead of
 * the running app, plus older ones whose "until" still covers this version.
 */
export function pickVisibleReleases(
  releases: UpdateRelease[],
  appVersion: string,
): UpdateRelease[] {
  const [current, ...older] = releases
    .filter((release) => release && Array.isArray(release.steps))
    .filter((release) => compareVersions(release.version, appVersion) <= 0)
    .sort((a, b) => compareVersions(b.version, a.version));
  if (!current) return [];
  return [
    current,
    ...older.filter((release) => release.until && isVersionWithin(appVersion, release.until)),
  ];
}

/** Unread until News was opened in this app version (or never opened). */
export function isNewsUnread(appVersion: string, seenVersion: string | null): boolean {
  return !seenVersion || compareVersions(appVersion, seenVersion) > 0;
}
