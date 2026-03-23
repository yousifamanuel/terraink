import { resolveFontSelection } from "@/core/fonts/catalog";
import type { FontSelection } from "@/core/fonts/types";

const POSTER_TYPOGRAPHY_STORAGE_KEY = "terraink.poster.typography";

export function readPosterTypographyPreferences(): {
  fontFamily: string;
  fontVariant: string;
} | null {
  if (typeof window === "undefined" || !window.localStorage) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(POSTER_TYPOGRAPHY_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as FontSelection;
    const resolved = resolveFontSelection(parsed);

    return {
      fontFamily: resolved.family.id,
      fontVariant: resolved.variant.id,
    };
  } catch {
    return null;
  }
}

export function writePosterTypographyPreferences(
  selection: FontSelection,
): void {
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }

  try {
    const resolved = resolveFontSelection(selection);
    window.localStorage.setItem(
      POSTER_TYPOGRAPHY_STORAGE_KEY,
      JSON.stringify({
        fontFamily: resolved.family.id,
        fontVariant: resolved.variant.id,
      }),
    );
  } catch {
    // Ignore localStorage errors so poster editing remains usable.
  }
}
