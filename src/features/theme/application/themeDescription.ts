import i18n from "@/core/i18n";
import type { ThemeOption } from "../domain/types";

/**
 * Translated description of a theme. Built-in themes use the locale files;
 * themes loaded at runtime bring their own translations; saved themes keep
 * their own text.
 */
export function getThemeDescription(
  theme: Pick<ThemeOption, "id" | "description" | "descriptions">,
): string {
  const language = (i18n.resolvedLanguage || i18n.language || "en").toLowerCase();
  const translations = theme.descriptions ?? {};
  const own = (
    translations[language] ??
    translations[language.split("-")[0]] ??
    theme.description ??
    ""
  ).trim();
  return i18n.t(`theme.descriptions.${theme.id}`, { defaultValue: own });
}
