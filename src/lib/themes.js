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

const themePaletteKeys = [
  "bg",
  "water",
  "parks",
  "road_primary",
  "road_secondary",
  "road_residential",
  "text",
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

export const themeNames = Object.entries(themesByName)
  .sort(([, left], [, right]) =>
    String(left?.name ?? "").localeCompare(String(right?.name ?? "")),
  )
  .map(([name]) => name);

export function getThemePalette(theme) {
  return themePaletteKeys
    .map((key) => theme?.[key])
    .filter((value) => typeof value === "string" && value.trim().length > 0);
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
    return themesByName[themeName];
  }

  if (defaultThemeName && themesByName[defaultThemeName]) {
    return themesByName[defaultThemeName];
  }

  return fallbackTheme;
}
