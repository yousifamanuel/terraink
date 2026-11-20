import { compareVersions } from "@/shared/utils/version";

/**
 * Marks a feature as new: a dot on its nav tab and a "New" label next to it,
 * until the visitor opens that tab. The list lives outside the app code.
 */
export interface FeatureHint {
  /** Feature id the app knows, e.g. "road-glow". */
  id: string;
  /** Nav tab it lives in, e.g. "style". */
  tab: string;
  /**
   * App versions to show it in: exact ("0.5.1") or a pattern where "x"
   * matches any number ("0.5.x" = every 0.5 version). With `until`, the
   * lowest version to show it in ("x" counts as 0).
   */
  version: string;
  /** Optional: show it in every version from `version` up to this one. */
  until?: string;
}

const text = (value: unknown) => (typeof value === "string" ? value.trim() : "");

/**
 * Reads the bundled hints file: groups of versions, each with its tabs and
 * the features new in them:
 *   [{ "version": "0.5.x", "until"?: "0.5.3", "tabs": { "style": ["road-glow"] } }]
 * Unusable entries are dropped.
 */
export function parseFeatureHints(raw: unknown[]): FeatureHint[] {
  return raw.flatMap((group) => {
    if (typeof group !== "object" || group === null) return [];
    const data = group as Record<string, unknown>;
    const version = text(data.version);
    const until = text(data.until);
    const tabs = data.tabs;
    if (!version || typeof tabs !== "object" || tabs === null) return [];
    return Object.entries(tabs as Record<string, unknown>).flatMap(([tab, ids]) =>
      (Array.isArray(ids) ? ids : [])
        .map(text)
        .filter(Boolean)
        .map((id) => ({ id, tab: tab.trim(), version, ...(until ? { until } : {}) })),
    );
  });
}

/** Whether a version matches a pattern like "0.5.x" ("x" = any number). */
function matchesPattern(version: string, pattern: string): boolean {
  const parts = version.split(".");
  return pattern.split(".").every((part, index) => part === "x" || part === (parts[index] ?? "0"));
}

/**
 * Whether a hint shows in this app version: its version pattern matches, or,
 * with `until`, the app version lies between the two (inclusive).
 */
export function isHintActive(hint: FeatureHint, appVersion: string): boolean {
  if (!hint.until) return matchesPattern(appVersion, hint.version);
  const lowest = hint.version.replace(/x/g, "0");
  return (
    compareVersions(appVersion, lowest) >= 0 && compareVersions(appVersion, hint.until) <= 0
  );
}
