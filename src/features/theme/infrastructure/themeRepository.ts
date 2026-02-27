// NOTE: additional_themes.json exists in src/data/ but is currently unused.
// It is preserved for potential future expansion of the theme registry.
import themesManifest from "@/data/themes.json";
import type { ResolvedTheme, ThemeOption } from "../domain/types";
import { DISPLAY_PALETTE_KEYS } from "../domain/types";

const hexColorPattern =
  /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
const colorReferencePattern = /^\$([a-zA-Z0-9_]+)$/;

const fallbackTheme: ResolvedTheme = {
  name: "Terracotta",
  description: "Mediterranean warmth - burnt orange and clay tones on cream",
  bg: "#F5EDE4",
  text: "#8B4513",
  gradient_color: "#F5EDE4",
  water: "#A8C4C4",
  parks: "#E8E0D0",
  road_motorway: "#A0522D",
  road_primary: "#B8653A",
  road_secondary: "#C9846A",
  road_tertiary: "#D9A08A",
  road_residential: "#E5C4B0",
  road_default: "#D9A08A",
};

const preferredThemeOrder = [
  "midnight_blue",
  "terracotta",
  "neon_cyberpunk",
  "coral",
  "heatwave",
  "ruby",
  "sage",
  "copper",
  "rustic",
];

const rawThemes: Record<string, Record<string, string>> = themesManifest &&
typeof themesManifest === "object" &&
(themesManifest as any).themes &&
typeof (themesManifest as any).themes === "object"
  ? (themesManifest as any).themes
  : {};

const themesByName: Record<string, Record<string, string>> = Object.entries(
  rawThemes,
).reduce((acc: Record<string, Record<string, string>>, [key, value]) => {
  if (key && value && typeof value === "object") {
    acc[key] = value;
  }
  return acc;
}, {});

const discoveredThemeNames = Object.keys(themesByName);
const preferredThemeNames = preferredThemeOrder.filter((id) =>
  discoveredThemeNames.includes(id),
);
const remainingThemeNames = discoveredThemeNames.filter(
  (id) => !preferredThemeOrder.includes(id),
);

export const themeNames = [...preferredThemeNames, ...remainingThemeNames];

function resolveThemeColor(
  theme: Record<string, string>,
  key: string,
  visitedKeys = new Set<string>(),
): string {
  const rawValue = theme?.[key];
  if (typeof rawValue !== "string") return "";

  const value = rawValue.trim();
  if (hexColorPattern.test(value)) return value;

  const referenceMatch = value.match(colorReferencePattern);
  if (!referenceMatch) return "";

  const referencedKey = referenceMatch[1];
  if (visitedKeys.has(referencedKey)) return "";

  const nextVisitedKeys = new Set(visitedKeys);
  nextVisitedKeys.add(referencedKey);
  return resolveThemeColor(theme, referencedKey, nextVisitedKeys);
}

function resolveThemeAliases(
  theme: Record<string, string>,
): Record<string, string> {
  if (!theme || typeof theme !== "object") return {};

  const resolved: Record<string, string> = {};
  for (const key of Object.keys(theme)) {
    if (key === "name" || key === "description") {
      resolved[key] = String(theme[key] ?? "");
      continue;
    }
    const color = resolveThemeColor(theme, key, new Set([key]));
    if (color) resolved[key] = color;
  }
  return resolved;
}

function normalizeTheme(theme: Record<string, string>): ResolvedTheme {
  const resolvedTheme = resolveThemeAliases(theme);
  const merged: any = { ...fallbackTheme, ...resolvedTheme };

  merged.gradient_color = merged.gradient_color || merged.bg;
  merged.road_motorway =
    merged.road_motorway || merged.road_primary || merged.text;
  merged.road_primary =
    merged.road_primary || merged.road_secondary || merged.text;
  merged.road_secondary =
    merged.road_secondary ||
    merged.road_primary ||
    merged.road_tertiary ||
    merged.text;
  merged.road_tertiary =
    merged.road_tertiary ||
    merged.road_secondary ||
    merged.road_residential ||
    merged.text;
  merged.road_residential =
    merged.road_residential ||
    merged.road_tertiary ||
    merged.road_secondary ||
    merged.text;
  merged.road_default =
    merged.road_default ||
    merged.road_tertiary ||
    merged.road_secondary ||
    merged.road_residential ||
    merged.road_primary ||
    merged.text;

  return merged as ResolvedTheme;
}

export function getThemePalette(theme: Record<string, string>): string[] {
  const normalizedTheme = normalizeTheme(theme);
  return DISPLAY_PALETTE_KEYS.map((key) =>
    String(normalizedTheme[key] ?? "").trim(),
  ).filter((color) => hexColorPattern.test(color));
}

export const themeOptions: ThemeOption[] = themeNames.map((name) => ({
  id: name,
  name: String(themesByName[name]?.name ?? name),
  description: String(themesByName[name]?.description ?? ""),
  palette: getThemePalette(themesByName[name]),
}));

const preferredDefaultThemeName = "midnight_blue";

export const defaultThemeName = themeNames.includes(preferredDefaultThemeName)
  ? preferredDefaultThemeName
  : (themeNames[0] ?? preferredDefaultThemeName);

export function getTheme(themeName: string): ResolvedTheme {
  if (themesByName[themeName]) {
    return normalizeTheme(themesByName[themeName]);
  }
  if (defaultThemeName && themesByName[defaultThemeName]) {
    return normalizeTheme(themesByName[defaultThemeName]);
  }
  return normalizeTheme(fallbackTheme as any);
}
