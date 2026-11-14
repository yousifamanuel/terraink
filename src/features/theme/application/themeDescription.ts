import i18n from "@/core/i18n";
import type { ThemeOption } from "../domain/types";

/** Translated description of a built-in theme; saved themes keep their own text. */
export function getThemeDescription(theme: Pick<ThemeOption, "id" | "description">): string {
  const own = theme.description?.trim() ?? "";
  return i18n.t(`theme.descriptions.${theme.id}`, { defaultValue: own });
}
