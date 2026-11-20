import { themeOptions } from "@/core/services";
import { nextFreeName } from "../domain/themeNames";

/**
 * Name suggested when saving a theme: the theme's own name with the next
 * free number. Built-in names count as taken, so a copy never repeats one.
 */
export function suggestSavedThemeName(baseName: string, savedNames: string[]): string {
  return nextFreeName(baseName, [...themeOptions.map((option) => option.name), ...savedNames]);
}
