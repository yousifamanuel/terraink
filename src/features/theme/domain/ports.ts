import type { ResolvedTheme, ThemeOption } from "./types";

export interface IThemeRepository {
  getTheme(themeName: string): ResolvedTheme;
  getThemeOptions(): ThemeOption[];
  getThemeNames(): string[];
  getDefaultThemeName(): string;
  getThemePalette(theme: Record<string, string>): string[];
}
