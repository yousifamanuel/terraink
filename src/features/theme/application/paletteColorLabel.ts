import i18n from "@/core/i18n";
import { PALETTE_COLOR_LABELS } from "../domain/types";
import type { ThemeColorKey } from "../domain/types";

/** Translated label for a palette colour key (falls back to the English label). */
export function getPaletteColorLabel(key: ThemeColorKey): string {
  return i18n.t(`theme.colors.${key}`, {
    defaultValue: PALETTE_COLOR_LABELS[key] ?? key,
  });
}
