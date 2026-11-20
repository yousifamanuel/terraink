import { getTheme, getThemeAppSection } from "@/core/services";
import { getThemeColorByPath } from "@/features/theme/domain/colorPaths";
import type { AppThemeSpec } from "../domain/types";

/**
 * The app theme a map theme offers through its "app" section; null when it
 * has none (then it is a poster theme only). Its colors are the theme's own,
 * so nothing is defined twice.
 */
export function appThemeFromTheme(themeId: string): AppThemeSpec | null {
  const app = getThemeAppSection(themeId);
  if (!app) return null;
  const theme = getTheme(themeId);
  // A color, or a path to one of the theme's own colors.
  const color = (value?: string) =>
    value?.startsWith("#") ? value : value && getThemeColorByPath(theme, value);
  const accent = color(app.accent);
  const text = color(app.text);
  return {
    id: themeId,
    bg: theme.ui.bg,
    ...(app.logo ? { logo: app.logo } : {}),
    ...(app.titleFont ? { titleFont: app.titleFont } : {}),
    ...(accent ? { accent } : {}),
    ...(text ? { text } : {}),
  };
}
