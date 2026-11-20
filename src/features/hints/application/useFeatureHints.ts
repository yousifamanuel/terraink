import { useSyncExternalStore } from "react";
import { APP_VERSION } from "@/core/config";
import { loadBundledHints, loadSeenHints, saveSeenHints } from "@/core/services";
import { isHintActive, parseFeatureHints, type FeatureHint } from "../domain/types";

// Hints for this app version, and the ids already seen.
const hints: FeatureHint[] = parseFeatureHints(loadBundledHints()).filter((hint) =>
  isHintActive(hint, APP_VERSION),
);
let seen = new Set(loadSeenHints());
// "New" labels stay for the whole visit, even after their tab was opened.
const newThisVisit = new Set(hints.filter((hint) => !seen.has(hint.id)).map((hint) => hint.id));

const listeners = new Set<() => void>();
let counts = countUnseen();

function countUnseen(): Record<string, number> {
  const result: Record<string, number> = {};
  for (const hint of hints) {
    if (!seen.has(hint.id)) result[hint.tab] = (result[hint.tab] ?? 0) + 1;
  }
  return result;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** The visitor opened a tab: its new features count as seen. */
export function markTabHintsSeen(tab: string): void {
  const ids = hints.filter((hint) => hint.tab === tab && !seen.has(hint.id)).map((hint) => hint.id);
  if (ids.length === 0) return;
  seen = new Set([...seen, ...ids]);
  saveSeenHints([...seen]);
  counts = countUnseen();
  listeners.forEach((listener) => listener());
}

/** Unseen new features per nav tab (tab id → count). */
export function useTabHintCounts(): Record<string, number> {
  return useSyncExternalStore(subscribe, () => counts);
}

/** Whether a feature is marked new during this visit. */
export function isNewFeature(id: string): boolean {
  return newThisVisit.has(id);
}
