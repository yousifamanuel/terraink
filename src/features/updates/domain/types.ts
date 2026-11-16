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

export function compareVersions(a: string, b: string): number {
  const left = a.split(".").map((part) => Number.parseInt(part, 10) || 0);
  const right = b.split(".").map((part) => Number.parseInt(part, 10) || 0);
  const length = Math.max(left.length, right.length);
  for (let index = 0; index < length; index += 1) {
    const diff = (left[index] ?? 0) - (right[index] ?? 0);
    if (diff !== 0) return diff > 0 ? 1 : -1;
  }
  return 0;
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
