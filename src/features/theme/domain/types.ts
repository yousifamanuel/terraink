export interface ThemeUiColors {
  bg: string;
  text: string;
}

export interface ThemeRoadColors {
  major: string;
  minor_high: string;
  minor_mid: string;
  minor_low: string;
  path: string;
  outline: string;
}

export interface ThemeMapColors {
  land: string;
  landcover: string;
  water: string;
  waterway: string;
  parks: string;
  buildings: string;
  aeroway: string;
  rail: string;
  roads: ThemeRoadColors;
}

export interface ThemeColors {
  ui: ThemeUiColors;
  map: ThemeMapColors;
}

export interface ResolvedTheme extends ThemeColors {
  name: string;
  description: string;
}

export type ThemeColorKey =
  | "ui.bg"
  | "ui.text"
  | "map.land"
  | "map.landcover"
  | "map.water"
  | "map.waterway"
  | "map.parks"
  | "map.buildings"
  | "map.aeroway"
  | "map.rail"
  | "map.roads.major"
  | "map.roads.minor_high"
  | "map.roads.minor_mid"
  | "map.roads.minor_low"
  | "map.roads.path"
  | "map.roads.outline";

export interface ThemeOption {
  id: string;
  name: string;
  description: string;
  palette: string[];
}

export interface SavedTheme {
  id: string;
  name: string;
  description: string;
  colors: ThemeColors;
  savedAt: string;
}

export const DISPLAY_PALETTE_KEYS: ThemeColorKey[] = [
  "ui.bg",
  "ui.text",
  "map.land",
  "map.landcover",
  "map.water",
  "map.waterway",
  "map.parks",
  "map.buildings",
  "map.aeroway",
  "map.rail",
  "map.roads.major",
  "map.roads.minor_high",
  "map.roads.minor_mid",
  "map.roads.minor_low",
  "map.roads.path",
  "map.roads.outline",
];

export const PALETTE_COLOR_LABELS: Record<ThemeColorKey, string> = {
  "ui.bg": "Overlay",
  "ui.text": "Text",
  "map.land": "Land",
  "map.landcover": "Landcover",
  "map.water": "Water",
  "map.waterway": "Waterways",
  "map.parks": "Parks",
  "map.buildings": "Buildings",
  "map.aeroway": "Aeroway",
  "map.rail": "Rail",
  "map.roads.major": "Roads Major",
  "map.roads.minor_high": "Roads Minor High",
  "map.roads.minor_mid": "Roads Minor Mid",
  "map.roads.minor_low": "Roads Minor Low",
  "map.roads.path": "Roads Path",
  "map.roads.outline": "Road Outline",
};
