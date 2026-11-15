import { useCallback, useState } from "react";
import { localStorageCache } from "@/core/cache/localStorageCache";

const PREFS_KEY = "terraink.colorEditor.prefs";
// Viewer preference: keep it for a year.
const PREFS_TTL_MS = 365 * 24 * 60 * 60 * 1000;

export interface ColorEditorPrefs {
  /** Colors shown in sections (poster, land, nature, …). */
  groupColors: boolean;
  /** Extra detail colors (forest, grass, borders, …) shown. */
  showDetails: boolean;
}

const DEFAULT_PREFS: ColorEditorPrefs = { groupColors: true, showDetails: false };

function readPrefs(): ColorEditorPrefs {
  const stored = localStorageCache.read<Partial<ColorEditorPrefs>>(
    PREFS_KEY,
    PREFS_TTL_MS,
  );
  return { ...DEFAULT_PREFS, ...(stored ?? {}) };
}

/** The color editor's two view toggles, remembered in this browser. */
export function useColorEditorPrefs() {
  const [prefs, setPrefs] = useState<ColorEditorPrefs>(readPrefs);

  const setPref = useCallback(
    <K extends keyof ColorEditorPrefs>(key: K, value: ColorEditorPrefs[K]) => {
      setPrefs((current) => {
        const next = { ...current, [key]: value };
        localStorageCache.write(PREFS_KEY, next);
        return next;
      });
    },
    [],
  );

  return { prefs, setPref };
}
