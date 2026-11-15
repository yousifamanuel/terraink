import {
  hslToRgb,
  parseHex,
  rgbToHexColor,
  rgbToHsl,
} from "@/shared/utils/color";
import type { ResolvedTheme } from "./types";

/** Whole-theme color adjustments, each 0 = unchanged. */
export interface ColorAdjustments {
  /** -50 … 50: darker / lighter. */
  brightness: number;
  /** -50 … 50: flatter / stronger light-dark difference. */
  contrast: number;
  /** -100 … 100: grey / more vivid. */
  saturation: number;
  /** -180 … 180 degrees around the color wheel. */
  hue: number;
  /** -50 … 50: cooler (blue) / warmer (orange). */
  warmth: number;
  /** Swap light and dark (e.g. a light theme becomes dark). */
  invert: boolean;
  /** No color, only shades of grey. */
  grayscale: boolean;
}

export const COLOR_ADJUST_LIMITS = {
  brightness: 50,
  contrast: 50,
  saturation: 100,
  hue: 180,
  warmth: 50,
} as const;

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

export function hasColorAdjustments(adjust: ColorAdjustments): boolean {
  return Boolean(
    adjust.brightness ||
      adjust.contrast ||
      adjust.saturation ||
      adjust.hue ||
      adjust.warmth ||
      adjust.invert ||
      adjust.grayscale,
  );
}

/** Most a channel moves at full warmth (±50). */
const WARMTH_SHIFT = 80;
const clamp255 = (value: number) => Math.min(255, Math.max(0, Math.round(value)));

/** One color with the adjustments applied; non-hex values pass through. */
export function adjustColor(color: string, adjust: ColorAdjustments): string {
  let rgb = parseHex(color);
  if (!rgb) return color;
  if (adjust.invert) rgb = { r: 255 - rgb.r, g: 255 - rgb.g, b: 255 - rgb.b };
  let { h, s, l } = rgbToHsl(rgb);
  h = (((h + adjust.hue / 360) % 1) + 1) % 1;
  s = adjust.grayscale ? 0 : clamp01(s * (1 + adjust.saturation / 100));
  const b = adjust.brightness / 100;
  l = clamp01(b >= 0 ? l + (1 - l) * b : l * (1 + b));
  l = clamp01(0.5 + (l - 0.5) * (1 + adjust.contrast / 100));
  const out = hslToRgb({ h, s, l });
  const warm = (adjust.warmth / COLOR_ADJUST_LIMITS.warmth) * (WARMTH_SHIFT / 2);
  return rgbToHexColor({
    r: clamp255(out.r + warm),
    g: out.g,
    b: clamp255(out.b - warm),
  });
}

function adjustDeep(value: unknown, adjust: ColorAdjustments): unknown {
  if (typeof value === "string") return adjustColor(value, adjust);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, inner]) => [key, adjustDeep(inner, adjust)]),
    );
  }
  return value;
}

/** Every color of the theme (text, overlay, map) adjusted the same way. */
export function adjustThemeColors(
  theme: ResolvedTheme,
  adjust: ColorAdjustments,
): ResolvedTheme {
  if (!hasColorAdjustments(adjust)) return theme;
  return {
    ...theme,
    ui: adjustDeep(theme.ui, adjust) as ResolvedTheme["ui"],
    map: adjustDeep(theme.map, adjust) as ResolvedTheme["map"],
  };
}
