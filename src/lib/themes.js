import themesManifest from "../themes/themes.json";

const fallbackTheme = {
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

const hexColorPattern = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
const colorReferencePattern = /^\$([a-zA-Z0-9_]+)$/;
export const displayPaletteKeys = [
  "bg",
  "water",
  "parks",
  "road_motorway",
  "road_primary",
  "road_secondary",
  "road_tertiary",
  "text",
];

export const paletteColorLabels = {
  bg: "Background",
  water: "Water",
  parks: "Parks",
  road_motorway: "Motorway",
  road_primary: "Primary Road",
  road_secondary: "Secondary Road",
  road_tertiary: "Tertiary Road",
  text: "Text",
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

const rawThemes =
  themesManifest &&
  typeof themesManifest === "object" &&
  themesManifest.themes &&
  typeof themesManifest.themes === "object"
    ? themesManifest.themes
    : {};

const themesByName = Object.entries(rawThemes).reduce((acc, [key, value]) => {
  if (key && value && typeof value === "object") {
    acc[key] = value;
  }
  return acc;
}, {});

const discoveredThemeNames = Object.keys(themesByName);
const preferredThemeNames = preferredThemeOrder.filter((themeId) =>
  discoveredThemeNames.includes(themeId),
);
const remainingThemeNames = discoveredThemeNames.filter(
  (themeId) => !preferredThemeOrder.includes(themeId),
);

export const themeNames = [...preferredThemeNames, ...remainingThemeNames];

function resolveThemeColor(theme, key, visitedKeys = new Set()) {
  const rawValue = theme?.[key];
  if (typeof rawValue !== "string") {
    return "";
  }

  const value = rawValue.trim();
  if (hexColorPattern.test(value)) {
    return value;
  }

  const referenceMatch = value.match(colorReferencePattern);
  if (!referenceMatch) {
    return "";
  }

  const referencedKey = referenceMatch[1];
  if (visitedKeys.has(referencedKey)) {
    return "";
  }

  const nextVisitedKeys = new Set(visitedKeys);
  nextVisitedKeys.add(referencedKey);
  return resolveThemeColor(theme, referencedKey, nextVisitedKeys);
}

function resolveThemeAliases(theme) {
  if (!theme || typeof theme !== "object") {
    return {};
  }

  const resolved = {};
  for (const key of Object.keys(theme)) {
    if (key === "name" || key === "description") {
      resolved[key] = String(theme[key] ?? "");
      continue;
    }

    const color = resolveThemeColor(theme, key, new Set([key]));
    if (color) {
      resolved[key] = color;
    }
  }

  return resolved;
}

function normalizeTheme(theme) {
  const resolvedTheme = resolveThemeAliases(theme);
  const mergedTheme = {
    ...fallbackTheme,
    ...resolvedTheme,
  };

  mergedTheme.gradient_color = mergedTheme.gradient_color || mergedTheme.bg;
  mergedTheme.road_motorway =
    mergedTheme.road_motorway || mergedTheme.road_primary || mergedTheme.text;
  mergedTheme.road_primary =
    mergedTheme.road_primary || mergedTheme.road_secondary || mergedTheme.text;
  mergedTheme.road_secondary =
    mergedTheme.road_secondary ||
    mergedTheme.road_primary ||
    mergedTheme.road_tertiary ||
    mergedTheme.text;
  mergedTheme.road_tertiary =
    mergedTheme.road_tertiary ||
    mergedTheme.road_secondary ||
    mergedTheme.road_residential ||
    mergedTheme.text;
  mergedTheme.road_residential =
    mergedTheme.road_residential ||
    mergedTheme.road_tertiary ||
    mergedTheme.road_secondary ||
    mergedTheme.text;
  mergedTheme.road_default =
    mergedTheme.road_default ||
    mergedTheme.road_tertiary ||
    mergedTheme.road_secondary ||
    mergedTheme.road_residential ||
    mergedTheme.road_primary ||
    mergedTheme.text;

  return mergedTheme;
}

export function getThemePalette(theme) {
  const normalizedTheme = normalizeTheme(theme);

  return displayPaletteKeys
    .map((key) => String(normalizedTheme[key] ?? "").trim())
    .filter((color) => hexColorPattern.test(color));
}

export const themeOptions = themeNames.map((name) => ({
  id: name,
  name: String(themesByName[name]?.name ?? name),
  description: String(themesByName[name]?.description ?? ""),
  palette: getThemePalette(themesByName[name]),
}));

const preferredDefaultThemeName = "midnight_blue";

export const defaultThemeName = themeNames.includes(preferredDefaultThemeName)
  ? preferredDefaultThemeName
  : (themeNames[0] ?? preferredDefaultThemeName);

export function getTheme(themeName) {
  if (themesByName[themeName]) {
    return normalizeTheme(themesByName[themeName]);
  }

  if (defaultThemeName && themesByName[defaultThemeName]) {
    return normalizeTheme(themesByName[defaultThemeName]);
  }

  return normalizeTheme(fallbackTheme);
}
