import { clamp } from "@/shared/geo/math";

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface HSL {
  h: number;
  s: number;
  l: number;
}

const SIX_DIGIT_HEX = /^#([0-9a-fA-F]{6})$/;
const THREE_DIGIT_HEX = /^#([0-9a-f]{3})$/i;

// ─── Normalize ───────────────────────────────────────────────────────────────

export function normalizeHexColor(color: string): string {
  if (typeof color !== "string") {
    return "";
  }

  const trimmed = color.trim().toLowerCase();
  if (SIX_DIGIT_HEX.test(trimmed)) {
    return trimmed;
  }

  const shortMatch = THREE_DIGIT_HEX.exec(trimmed);
  if (!shortMatch) {
    return "";
  }

  const [, value] = shortMatch;
  return `#${value[0]}${value[0]}${value[1]}${value[1]}${value[2]}${value[2]}`;
}

export function toUniqueHexColors(colors: string[] = []): string[] {
  const unique: string[] = [];
  const seen = new Set<string>();

  for (const color of colors) {
    const normalized = normalizeHexColor(color);
    if (!normalized || seen.has(normalized)) {
      continue;
    }
    seen.add(normalized);
    unique.push(normalized);
  }

  return unique;
}

// ─── Parse ───────────────────────────────────────────────────────────────────

/**
 * Single unified hex → RGB parser (replaces both utils/color parseHexColor
 * and posterRenderer/colors parseHex). Uses bit-shifting for performance.
 */
export function parseHex(hex: string): RGB | null {
  if (typeof hex !== "string") {
    return null;
  }

  let normalized = hex.trim().replace("#", "");
  if (normalized.length === 3) {
    normalized = normalized
      .split("")
      .map((char) => `${char}${char}`)
      .join("");
  }

  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
    return null;
  }

  const value = Number.parseInt(normalized, 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

/** Alias kept for backward compatibility in UI code */
export function parseHexColor(color: string): RGB | null {
  return parseHex(normalizeHexColor(color) || color);
}

export function hexToRgb(
  color: string,
  fallback: RGB = { r: 0, g: 0, b: 0 },
): RGB {
  return parseHex(color) ?? fallback;
}

// ─── RGB / HSL Conversion ────────────────────────────────────────────────────

export function rgbToHexColor({ r, g, b }: RGB): string {
  return `#${[r, g, b]
    .map((v) =>
      clamp(Math.round(Number(v) || 0), 0, 255)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
}

export function rgbToHsl({ r, g, b }: RGB): HSL {
  const red = clamp(r, 0, 255) / 255;
  const green = clamp(g, 0, 255) / 255;
  const blue = clamp(b, 0, 255) / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const lightness = (max + min) / 2;
  const delta = max - min;

  if (delta === 0) {
    return { h: 0, s: 0, l: lightness };
  }

  const saturation =
    lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);

  let hue = 0;
  if (max === red) {
    hue = (green - blue) / delta + (green < blue ? 6 : 0);
  } else if (max === green) {
    hue = (blue - red) / delta + 2;
  } else {
    hue = (red - green) / delta + 4;
  }

  return { h: hue / 6, s: saturation, l: lightness };
}

function hueToRgb(p: number, q: number, t: number): number {
  let nextT = t;
  if (nextT < 0) nextT += 1;
  if (nextT > 1) nextT -= 1;
  if (nextT < 1 / 6) return p + (q - p) * 6 * nextT;
  if (nextT < 1 / 2) return q;
  if (nextT < 2 / 3) return p + (q - p) * (2 / 3 - nextT) * 6;
  return p;
}

export function hslToRgb({ h, s, l }: HSL): RGB {
  const hue = ((h % 1) + 1) % 1;
  const saturation = clamp(s, 0, 1);
  const lightness = clamp(l, 0, 1);

  if (saturation === 0) {
    const value = Math.round(lightness * 255);
    return { r: value, g: value, b: value };
  }

  const q =
    lightness < 0.5
      ? lightness * (1 + saturation)
      : lightness + saturation - lightness * saturation;
  const p = 2 * lightness - q;

  return {
    r: Math.round(hueToRgb(p, q, hue + 1 / 3) * 255),
    g: Math.round(hueToRgb(p, q, hue) * 255),
    b: Math.round(hueToRgb(p, q, hue - 1 / 3) * 255),
  };
}

export function hslToHexColor(hsl: HSL): string {
  return rgbToHexColor(hslToRgb(hsl));
}

export function shiftHexColor(
  color: string,
  {
    hShift = 0,
    sShift = 0,
    lShift = 0,
  }: { hShift?: number; sShift?: number; lShift?: number },
): string {
  const rgb = parseHex(color);
  if (!rgb) {
    return "";
  }

  const hsl = rgbToHsl(rgb);
  return rgbToHexColor(
    hslToRgb({
      h: hsl.h + hShift,
      s: clamp(hsl.s + sShift, 0, 1),
      l: clamp(hsl.l + lShift, 0, 1),
    }),
  );
}

// ─── Renderer helpers (consolidated from posterRenderer/colors) ──────────────

export function withAlpha(hex: string, alpha: number): string {
  const rgb = parseHex(hex);
  if (!rgb) {
    return `rgba(0, 0, 0, ${alpha})`;
  }

  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

export function blendHex(hexA: string, hexB: string, weight = 0.5): string {
  const a = parseHex(hexA);
  const b = parseHex(hexB);
  if (!a && !b) {
    return "#888888";
  }
  if (!a) {
    return hexB;
  }
  if (!b) {
    return hexA;
  }

  const t = Math.min(Math.max(weight, 0), 1);
  const mix = (from: number, to: number) => Math.round(from * (1 - t) + to * t);
  const r = mix(a.r, b.r).toString(16).padStart(2, "0");
  const g = mix(a.g, b.g).toString(16).padStart(2, "0");
  const bChannel = mix(a.b, b.b).toString(16).padStart(2, "0");

  return `#${r}${g}${bChannel}`;
}
