export interface ThemeColors {
  bg: string;
  text: string;
  gradient_color: string;
  water: string;
  parks: string;
  road_motorway: string;
  road_primary: string;
  road_secondary: string;
  road_tertiary: string;
  road_residential: string;
  road_default: string;
  [key: string]: string;
}

export interface ResolvedTheme extends ThemeColors {
  name: string;
  description: string;
}

export type ThemeColorKey = string & keyof ThemeColors;

export interface ThemeOption {
  id: string;
  name: string;
  description: string;
  palette: string[];
}

export const DISPLAY_PALETTE_KEYS: string[] = [
  "bg",
  "water",
  "parks",
  "road_motorway",
  "road_primary",
  "road_secondary",
  "road_tertiary",
  "text",
];

export const PALETTE_COLOR_LABELS: Record<string, string> = {
  bg: "Background",
  water: "Water",
  parks: "Parks",
  road_motorway: "Motorway",
  road_primary: "Primary Road",
  road_secondary: "Secondary Road",
  road_tertiary: "Tertiary Road",
  text: "Text",
};
