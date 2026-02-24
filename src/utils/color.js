import { clamp } from "./number";

const SIX_DIGIT_HEX_COLOR = /^#([0-9a-fA-F]{6})$/;
const THREE_DIGIT_HEX_COLOR = /^#([0-9a-f]{3})$/i;

export function normalizeHexColor(color) {
  if (typeof color !== "string") {
    return "";
  }

  const trimmed = color.trim().toLowerCase();
  if (SIX_DIGIT_HEX_COLOR.test(trimmed)) {
    return trimmed;
  }

  const shortMatch = THREE_DIGIT_HEX_COLOR.exec(trimmed);
  if (!shortMatch) {
    return "";
  }

  const [, value] = shortMatch;
  return `#${value[0]}${value[0]}${value[1]}${value[1]}${value[2]}${value[2]}`;
}

export function toUniqueHexColors(colors = []) {
  const uniqueColors = [];
  const seen = new Set();

  for (const color of colors) {
    const normalized = normalizeHexColor(color);
    if (!normalized || seen.has(normalized)) {
      continue;
    }
    seen.add(normalized);
    uniqueColors.push(normalized);
  }

  return uniqueColors;
}

export function parseHexColor(color) {
  const normalized = normalizeHexColor(color);
  if (!normalized) {
    return null;
  }

  return {
    r: parseInt(normalized.slice(1, 3), 16),
    g: parseInt(normalized.slice(3, 5), 16),
    b: parseInt(normalized.slice(5, 7), 16),
  };
}

export function hexToRgb(color, fallback = { r: 0, g: 0, b: 0 }) {
  return parseHexColor(color) ?? fallback;
}

export function rgbToHexColor({ r, g, b }) {
  return `#${[r, g, b]
    .map((value) =>
      clamp(Math.round(Number(value) || 0), 0, 255).toString(16).padStart(2, "0"),
    )
    .join("")}`;
}

export function rgbToHsl({ r, g, b }) {
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

  return {
    h: hue / 6,
    s: saturation,
    l: lightness,
  };
}

function hueToRgb(p, q, t) {
  let nextT = t;
  if (nextT < 0) {
    nextT += 1;
  }
  if (nextT > 1) {
    nextT -= 1;
  }
  if (nextT < 1 / 6) {
    return p + (q - p) * 6 * nextT;
  }
  if (nextT < 1 / 2) {
    return q;
  }
  if (nextT < 2 / 3) {
    return p + (q - p) * (2 / 3 - nextT) * 6;
  }
  return p;
}

export function hslToRgb({ h, s, l }) {
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

export function hslToHexColor(hsl) {
  return rgbToHexColor(hslToRgb(hsl));
}

export function shiftHexColor(color, { hShift = 0, sShift = 0, lShift = 0 }) {
  const rgb = parseHexColor(color);
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
