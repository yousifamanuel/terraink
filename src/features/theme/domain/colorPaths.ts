import { blendHex } from "@/shared/utils/color";
import type { ResolvedTheme, ThemeColorKey } from "./types";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

type ColorReader = (key: ThemeColorKey) => string;

/**
 * Colors that copy another one until they are set on their own: a key to
 * copy, or a rule that mixes other colors.
 */
export const THEME_COLOR_FALLBACKS: Partial<
  Record<ThemeColorKey, ThemeColorKey | ((read: ColorReader) => string)>
> = {
  "ui.border": "ui.bg",
  "ui.borderLine": "ui.text",
  "map.forest": "map.landcover",
  "map.grass": "map.landcover",
  "map.farmland": "map.landcover",
  "map.wetland": "map.landcover",
  "map.sand": "map.landcover",
  "map.ice": "map.landcover",
  // The look country borders always had: mostly text, a little land.
  "map.borders": (read) =>
    blendHex(read("map.land") || "#ffffff", read("ui.text") || "#111111", 0.82),
};

/** Edit value meaning "drop this color, copy the main color again". */
export const INHERIT_COLOR = "inherit";

/** The main color a detail color copies, if it copies one key. */
export function getColorParent(key: ThemeColorKey): ThemeColorKey | null {
  const fallback = THEME_COLOR_FALLBACKS[key];
  return typeof fallback === "string" ? fallback : null;
}

/** Detail colors that copy this main color until set on their own. */
export function getColorChildren(key: ThemeColorKey): ThemeColorKey[] {
  return (Object.keys(THEME_COLOR_FALLBACKS) as ThemeColorKey[]).filter(
    (child) => getColorParent(child) === key,
  );
}

function resolveFallback(key: ThemeColorKey, read: ColorReader): string {
  const fallback = THEME_COLOR_FALLBACKS[key];
  if (!fallback) return "";
  return typeof fallback === "string" ? read(fallback) : fallback(read);
}

export function getThemeColorByPath(
  theme: unknown,
  keyPath: ThemeColorKey | string,
): string {
  const own = readColorPath(theme, keyPath);
  if (own) return own;
  return resolveFallback(keyPath as ThemeColorKey, (key) =>
    getThemeColorByPath(theme, key),
  );
}

/** True when the key has a color of its own (theme or edit), not a copy. */
export function hasOwnEditedColor(
  theme: unknown,
  overrides: Record<string, string>,
  keyPath: ThemeColorKey,
): boolean {
  const edit = overrides[keyPath];
  if (edit === INHERIT_COLOR) return false;
  return Boolean(edit) || Boolean(readColorPath(theme, keyPath));
}

/**
 * The color a key shows with the user's unsaved edits applied: its own edit,
 * else its theme value, else the edited color(s) it copies.
 */
export function getEditedThemeColor(
  theme: unknown,
  overrides: Record<string, string>,
  keyPath: ThemeColorKey,
): string {
  const edit = overrides[keyPath];
  if (edit && edit !== INHERIT_COLOR) return edit;
  const own = edit === INHERIT_COLOR ? "" : readColorPath(theme, keyPath);
  if (own) return own;
  return resolveFallback(keyPath, (key) =>
    getEditedThemeColor(theme, overrides, key),
  );
}

function readColorPath(theme: unknown, keyPath: string): string {
  if (!isObject(theme)) return "";

  const segments = String(keyPath)
    .split(".")
    .filter(Boolean);
  let current: unknown = theme;

  for (const segment of segments) {
    if (!isObject(current) || !(segment in current)) return "";
    current = current[segment];
  }

  return typeof current === "string" ? current : "";
}

function setThemeColorByPath(
  theme: Record<string, unknown>,
  keyPath: string,
  value: string,
): void {
  const segments = keyPath.split(".").filter(Boolean);
  if (segments.length === 0) return;

  let current: Record<string, unknown> = theme;
  for (let index = 0; index < segments.length - 1; index += 1) {
    const segment = segments[index];
    const next = current[segment];
    if (!isObject(next)) {
      current[segment] = {};
    }
    current = current[segment] as Record<string, unknown>;
  }

  current[segments[segments.length - 1]] = value;
}

function deleteThemeColorByPath(
  theme: Record<string, unknown>,
  keyPath: string,
): void {
  const segments = keyPath.split(".").filter(Boolean);
  let current: unknown = theme;
  for (const segment of segments.slice(0, -1)) {
    if (!isObject(current)) return;
    current = current[segment];
  }
  if (isObject(current)) delete current[segments[segments.length - 1]];
}

export function applyThemeColorOverrides(
  baseTheme: ResolvedTheme,
  overrides: Record<string, string>,
): ResolvedTheme {
  const hasOverrides = Object.keys(overrides).length > 0;
  if (!hasOverrides) return baseTheme;

  const nextTheme: ResolvedTheme = {
    ...baseTheme,
    ui: { ...baseTheme.ui },
    map: {
      ...baseTheme.map,
      roads: { ...baseTheme.map.roads },
    },
  };

  for (const [keyPath, color] of Object.entries(overrides)) {
    if (color === INHERIT_COLOR) {
      deleteThemeColorByPath(nextTheme as unknown as Record<string, unknown>, keyPath);
      continue;
    }
    if (typeof color !== "string" || !color.trim()) continue;
    setThemeColorByPath(nextTheme as unknown as Record<string, unknown>, keyPath, color);
  }

  return nextTheme;
}
