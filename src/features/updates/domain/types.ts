import { compareVersions } from "@/shared/utils/version";

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
  labels?: { summaryTitle?: string; detailsTitle?: string };
  summary?: { title?: string; points: UpdatePoint[] };
  steps: UpdateStep[];
}


/** The newest release that is not ahead of the running app. */
export function pickCurrentRelease(
  releases: UpdateRelease[],
  appVersion: string,
): UpdateRelease | null {
  return releases
    .filter((release) => release && Array.isArray(release.steps))
    .filter((release) => compareVersions(release.version, appVersion) <= 0)
    .sort((a, b) => compareVersions(b.version, a.version))[0] ?? null;
}

/** Unread until News was opened in this app version (or never opened). */
export function isNewsUnread(appVersion: string, seenVersion: string | null): boolean {
  return !seenVersion || compareVersions(appVersion, seenVersion) > 0;
}
