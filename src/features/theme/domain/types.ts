export interface ThemeUiColors {
  bg: string;
  text: string;
  /** Poster border area; unset = same as bg. */
  border?: string;
  /** Poster border line; unset = same as text. */
  borderLine?: string;
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
  /** Detail colors: unset ones copy their main color (see THEME_COLOR_FALLBACKS). */
  forest?: string;
  grass?: string;
  farmland?: string;
  wetland?: string;
  sand?: string;
  ice?: string;
  borders?: string;
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
  | "ui.border"
  | "ui.borderLine"
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
  | "map.roads.outline"
  | "map.forest"
  | "map.grass"
  | "map.farmland"
  | "map.wetland"
  | "map.sand"
  | "map.ice"
  | "map.borders";

export interface ThemeOption {
  id: string;
  name: string;
  description: string;
  /** Translated descriptions by language code (themes loaded at runtime). */
  descriptions?: Record<string, string>;
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
  "ui.border",
  "ui.borderLine",
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
  "ui.border": "Border",
  "ui.borderLine": "Border line",
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
  "map.forest": "Forest",
  "map.grass": "Grass",
  "map.farmland": "Farmland",
  "map.wetland": "Wetland",
  "map.sand": "Sand",
  "map.ice": "Ice",
  "map.borders": "Country borders",
};

export type ThemeColorGroupId =
  | "poster"
  | "land"
  | "nature"
  | "water"
  | "transport"
  | "roads";

export interface ThemeColorGroup {
  id: ThemeColorGroupId;
  /** Always shown. */
  keys: ThemeColorKey[];
  /** Shown only with "Show details"; they copy a main color until set. */
  detailKeys: ThemeColorKey[];
}

/** How the color editor groups the theme colors. */
export const THEME_COLOR_GROUPS: ThemeColorGroup[] = [
  {
    id: "poster",
    keys: ["ui.bg", "ui.text", "ui.border", "ui.borderLine"],
    detailKeys: [],
  },
  {
    id: "land",
    keys: ["map.land", "map.buildings"],
    detailKeys: ["map.borders"],
  },
  {
    id: "nature",
    // Landcover first: the detail colors below copy it.
    keys: ["map.landcover", "map.parks"],
    detailKeys: [
      "map.forest",
      "map.grass",
      "map.farmland",
      "map.wetland",
      "map.sand",
      "map.ice",
    ],
  },
  {
    id: "water",
    keys: ["map.water", "map.waterway"],
    detailKeys: [],
  },
  {
    id: "transport",
    keys: ["map.aeroway", "map.rail"],
    detailKeys: [],
  },
  {
    id: "roads",
    keys: [
      "map.roads.major",
      "map.roads.minor_high",
      "map.roads.minor_mid",
      "map.roads.minor_low",
      "map.roads.path",
      "map.roads.outline",
    ],
    detailKeys: [],
  },
];

/** Every detail color key, in editor order. */
export const DETAIL_COLOR_KEYS: ThemeColorKey[] = THEME_COLOR_GROUPS.flatMap(
  (group) => group.detailKeys,
);
