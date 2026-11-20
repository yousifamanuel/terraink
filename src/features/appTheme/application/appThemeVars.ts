import { posterTitleWeight } from "@/core/fonts";
import { parseHex, rgbToHsl } from "@/shared/utils/color";
import type { AppThemeSpec } from "../domain/types";

function hsl(hex: string) {
  const rgb = parseHex(hex);
  return rgb ? rgbToHsl(rgb) : null;
}

/**
 * CSS variables for an app theme; no theme = no variables = the look the
 * stylesheets hold (the default theme's).
 * - Blues (backgrounds, lines) turn by --app-hue-shift (degrees) and scale
 *   their saturation by --app-sat, measured from `baseBg`, the default
 *   theme's background.
 * - Light text and icons take the hue and saturation of the theme's text
 *   color (--app-text-hue, --app-text-s); greens take those of its accent
 *   (--app-accent-hue, --app-accent-s). Each keeps its own lightness.
 * - --app-theme-bg / -text / -accent are the theme's colors as they are.
 */
export function buildAppThemeVars(
  spec: AppThemeSpec | null,
  baseBg: string,
): Record<string, string> {
  const vars: Record<string, string> = {};
  if (!spec) return vars;
  const target = hsl(spec.bg);
  const base = hsl(baseBg);
  if (target && base) {
    let shift = (target.h - base.h) * 360;
    if (shift > 180) shift -= 360;
    if (shift < -180) shift += 360;
    const sat = base.s > 0 ? Math.min(3, Math.max(0.4, target.s / base.s)) : 1;
    vars["--app-hue-shift"] = shift.toFixed(1);
    vars["--app-sat"] = sat.toFixed(2);
  }
  vars["--app-theme-bg"] = spec.bg;
  const text = spec.text ? hsl(spec.text) : null;
  if (spec.text && text) {
    vars["--app-theme-text"] = spec.text;
    vars["--app-text-hue"] = (text.h * 360).toFixed(1);
    vars["--app-text-s"] = (text.s * 100).toFixed(1);
  }
  const accent = spec.accent ? hsl(spec.accent) : null;
  if (spec.accent && accent) {
    vars["--app-theme-accent"] = spec.accent;
    vars["--app-accent-hue"] = (accent.h * 360).toFixed(1);
    vars["--app-accent-s"] = (accent.s * 100).toFixed(1);
  }
  if (spec.titleFont) {
    vars["--app-title-font"] = `"${spec.titleFont}", "Bebas Neue", sans-serif`;
    // Single-weight display faces stay regular; a faked bold fills them in.
    vars["--app-title-weight"] = String(posterTitleWeight(spec.titleFont));
  }
  return vars;
}
