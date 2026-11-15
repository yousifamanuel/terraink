import type { ResolvedTheme, ThemeColorKey } from "./types";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** Colors that copy another one until they are set on their own. */
export const THEME_COLOR_FALLBACKS: Partial<Record<ThemeColorKey, ThemeColorKey>> = {
  "ui.border": "ui.bg",
  "ui.borderLine": "ui.text",
};

export function getThemeColorByPath(
  theme: unknown,
  keyPath: ThemeColorKey | string,
): string {
  const own = readColorPath(theme, keyPath);
  if (own) return own;
  const fallback = THEME_COLOR_FALLBACKS[keyPath as ThemeColorKey];
  return fallback ? readColorPath(theme, fallback) : "";
}

/**
 * The color a key shows with the user's unsaved edits applied: its own edit,
 * else its theme value, else (for border colors) the edited color it copies.
 */
export function getEditedThemeColor(
  theme: unknown,
  overrides: Record<string, string>,
  keyPath: ThemeColorKey,
): string {
  if (overrides[keyPath]) return overrides[keyPath];
  const own = readColorPath(theme, keyPath);
  if (own) return own;
  const fallback = THEME_COLOR_FALLBACKS[keyPath];
  return fallback ? getEditedThemeColor(theme, overrides, fallback) : "";
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
    if (typeof color !== "string" || !color.trim()) continue;
    setThemeColorByPath(nextTheme as unknown as Record<string, unknown>, keyPath, color);
  }

  return nextTheme;
}
