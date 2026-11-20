import bundledHints from "virtual:feature-hints";

/** The feature hints bundled at build time, still to be checked. */
export function loadBundledHints(): unknown[] {
  return Array.isArray(bundledHints) ? bundledHints : [];
}
