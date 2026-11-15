/** Theme categories for the Theme tab, in display order. */
export type ThemeCategoryId =
  | "neutral"
  | "sand"
  | "warm"
  | "water"
  | "green"
  | "light"
  | "dark"
  | "electric";

export interface ThemeCategory {
  id: ThemeCategoryId;
  /** Small color dot shown on the category tab. */
  color: string;
  /** A theme can be in several categories. */
  themeIds: string[];
}

export const THEME_CATEGORIES: ThemeCategory[] = [
  {
    id: "neutral",
    color: "#A6A6A6",
    themeIds: ["carrara", "graphite", "noir", "japanese_ink", "contrast_zones"],
  },
  { id: "sand", color: "#E4CF92", themeIds: ["sandstone", "desert", "rustic"] },
  {
    id: "warm",
    color: "#C8742E",
    themeIds: ["amber", "autumn", "copper", "heatwave", "terracotta", "rustic"],
  },
  {
    id: "water",
    color: "#4FA3B8",
    themeIds: [
      "terracotta",
      "copper_patina",
      "ocean",
      "mono_blue",
      "blueprint",
      "forest",
    ],
  },
  {
    id: "green",
    color: "#5FA36A",
    themeIds: ["sage", "forest", "emerald", "copper_patina"],
  },
  {
    id: "light",
    color: "#F0C6CC",
    themeIds: ["blush", "coral", "pastel_dream", "sage"],
  },
  {
    id: "dark",
    color: "#1B2438",
    themeIds: [
      "midnight_blue",
      "old_navy",
      "blueprint",
      "heatwave",
      "ruby",
      "emerald",
      "noir",
      "graphite",
    ],
  },
  { id: "electric", color: "#FF2BD6", themeIds: ["neon", "cyber"] },
];

/** Themes of one category, kept in the list's own order. */
export function themesInCategory<T extends { id: string }>(
  themes: T[],
  categoryId: ThemeCategoryId,
): T[] {
  const ids = THEME_CATEGORIES.find((c) => c.id === categoryId)?.themeIds ?? [];
  return themes.filter((theme) => ids.includes(theme.id));
}
