/**
 * Shared poster text layout constants and pure helpers used by both the live
 * preview overlay and the export canvas renderer.
 */
import { parseHex } from "@/shared/utils/color";
export const TEXT_DIMENSION_REFERENCE_PX = 3600;

export const TEXT_CITY_Y_RATIO = 0.845;
export const TEXT_DIVIDER_Y_RATIO = 0.875;
export const TEXT_COUNTRY_Y_RATIO = 0.9;
export const TEXT_COORDS_Y_RATIO = 0.93;

/** Margin from the edges for attribution/credits. */
export const TEXT_EDGE_MARGIN_RATIO = 0.02;

/** City text scales down when labels get long. */
export const CITY_TEXT_SHRINK_THRESHOLD = 10;

export const CITY_FONT_BASE_PX = 250;
export const CITY_FONT_MIN_PX = 110;
export const COUNTRY_FONT_BASE_PX = 92;
export const COORDS_FONT_BASE_PX = 58;
export const ATTRIBUTION_FONT_BASE_PX = 50;
/**
 * Title glow at strength 1: two soft halos in the text's own color, as blur
 * radii in multiples of the font size (CSS em, canvas px of the font size).
 */
export const TEXT_GLOW_BLURS = [0.18, 0.06] as const;

/** CSS text-shadow for a glow of the given strength (0 = none). */
export function textGlowShadow(color: string, strength: number | undefined): string | undefined {
  if (!strength) return undefined;
  return TEXT_GLOW_BLURS.map((blur) => `0 0 ${(blur * strength).toFixed(3)}em ${color}`).join(", ");
}

/** Credits keep the default face, so they stay readable with any poster font. */
export const ATTRIBUTION_FONT_FAMILY = '"IBM Plex Mono", monospace';

export function isLatinScript(text: string | undefined | null): boolean {
  if (!text) {
    return true;
  }

  let latinCount = 0;
  let alphaCount = 0;

  for (const char of text) {
    if (/[A-Za-z\u00C0-\u024F]/.test(char)) {
      latinCount += 1;
      alphaCount += 1;
    } else if (/\p{L}/u.test(char)) {
      alphaCount += 1;
    }
  }

  if (alphaCount === 0) {
    return true;
  }

  return latinCount / alphaCount > 0.8;
}

export function formatCityLabel(city: string, letterSpaced = true): string {
  if (!letterSpaced) {
    return city.toUpperCase();
  }
  return isLatinScript(city) ? city.toUpperCase().split("").join("  ") : city;
}

/**
 * Returns a multiplier (≤1) to shrink the city font for long names.
 * Callers apply it to their own base font size.
 */
export function computeCityFontScale(city: string): number {
  const len = Math.max(city.length, 1);
  if (len <= CITY_TEXT_SHRINK_THRESHOLD) {
    return 1;
  }
  return Math.max(
    CITY_FONT_MIN_PX / CITY_FONT_BASE_PX,
    CITY_TEXT_SHRINK_THRESHOLD / len,
  );
}

/**
 * Determines the correct attribution text colour.
 * When markers are shown the text colour is used directly;
 * otherwise a light/dark safe colour is derived from the land luminance.
 */
export function computeAttributionColor(
  textColor: string,
  landHex: string,
  showOverlay: boolean,
): string {
  if (showOverlay) {
    return textColor;
  }
  const landRgb = parseHex(landHex);
  const luma = landRgb
    ? (0.2126 * landRgb.r + 0.7152 * landRgb.g + 0.0722 * landRgb.b) / 255
    : 0.5;
  return luma < 0.52 ? "#f5faff" : "#0e1822";
}
