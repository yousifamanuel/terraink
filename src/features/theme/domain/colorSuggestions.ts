import {
  normalizeHexColor,
  shiftHexColor,
  toUniqueHexColors,
} from "@/shared/utils/color";
import type { ThemeOption, ResolvedTheme } from "./types";
import { DISPLAY_PALETTE_KEYS } from "./types";

/** Default palette extractor — pulls colors from DISPLAY_PALETTE_KEYS. */
function defaultGetThemePalette(theme: Record<string, string>): string[] {
  return DISPLAY_PALETTE_KEYS.map((key) => theme[key]).filter(Boolean);
}

/**
 * Creates a fallback theme option when the theme is not found in the registry.
 */
export function createFallbackThemeOption(
  themeId: string,
  selectedTheme: ResolvedTheme | null,
  getThemePalette: (
    theme: Record<string, string>,
  ) => string[] = defaultGetThemePalette,
): ThemeOption {
  return {
    id: themeId,
    name: String(selectedTheme?.name ?? themeId ?? "Theme"),
    description: String(selectedTheme?.description ?? ""),
    palette: selectedTheme ? getThemePalette(selectedTheme) : [],
  };
}

/**
 * Pure function: builds suggested + more color choices based on current color and palette.
 */
export function buildDynamicColorChoices(
  currentColor: string,
  paletteColors: string[],
): { suggestedColors: string[]; moreColors: string[] } {
  const uniquePalette = toUniqueHexColors(paletteColors);
  const baseColor = normalizeHexColor(currentColor) || uniquePalette[0] || "";
  if (!baseColor) {
    return { suggestedColors: [], moreColors: [] };
  }

  const suggested: string[] = [];
  const suggestedSeen = new Set<string>();
  const more: string[] = [];
  const moreSeen = new Set<string>();

  function addSuggested(color: string) {
    const normalized = normalizeHexColor(color);
    if (!normalized || suggestedSeen.has(normalized)) return;
    suggestedSeen.add(normalized);
    suggested.push(normalized);
  }

  function addMore(color: string) {
    const normalized = normalizeHexColor(color);
    if (
      !normalized ||
      suggestedSeen.has(normalized) ||
      moreSeen.has(normalized)
    )
      return;
    moreSeen.add(normalized);
    more.push(normalized);
  }

  const suggestedProfiles = [
    { sShift: -0.24, lShift: 0.33 },
    { sShift: -0.18, lShift: 0.25 },
    { sShift: -0.12, lShift: 0.18 },
    { sShift: -0.06, lShift: 0.1 },
    { sShift: 0, lShift: 0 },
    { sShift: 0.04, lShift: -0.08 },
    { sShift: 0.08, lShift: -0.15 },
    { sShift: 0.12, lShift: -0.22 },
    { sShift: 0.16, lShift: -0.29 },
    { sShift: 0.2, lShift: -0.36 },
  ];

  for (const profile of suggestedProfiles) {
    addSuggested(shiftHexColor(baseColor, profile));
  }

  if (suggested.length < 10) {
    for (const color of uniquePalette) {
      addSuggested(color);
      if (suggested.length >= 10) break;
    }
  }

  const hueOffsets = [-0.08, -0.04, 0, 0.04, 0.08];
  const toneProfiles = [
    { sShift: -0.1, lShift: 0.2 },
    { sShift: 0, lShift: 0 },
    { sShift: 0.12, lShift: -0.2 },
  ];

  for (const hueShift of hueOffsets) {
    for (const tone of toneProfiles) {
      addMore(
        shiftHexColor(baseColor, {
          hShift: hueShift,
          sShift: tone.sShift,
          lShift: tone.lShift,
        }),
      );
    }
  }

  if (more.length < 15) {
    for (const color of uniquePalette) {
      addMore(shiftHexColor(color, { lShift: 0.18, sShift: -0.08 }));
      addMore(color);
      addMore(shiftHexColor(color, { lShift: -0.2, sShift: 0.08 }));
      if (more.length >= 15) break;
    }
  }

  return {
    suggestedColors: suggested.slice(0, 10),
    moreColors: more.slice(0, 15),
  };
}
