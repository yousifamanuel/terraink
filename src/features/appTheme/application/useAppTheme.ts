import { useEffect, useSyncExternalStore } from "react";
import {
  applyAppThemeVars,
  defaultThemeName,
  ensureFont,
  getTheme,
  loadAppThemeFollow,
  saveAppThemeFollow,
} from "@/core/services";
import { STANDARD_LOGO, type AppThemeSpec } from "../domain/types";
import { buildAppThemeVars } from "./appThemeVars";
import { appThemeFromTheme } from "./appThemeFromTheme";

interface AppThemeState {
  /** The app's look; null = the stylesheets' own look. */
  active: AppThemeSpec | null;
  /** The look the app starts with (e.g. a campaign's main theme). */
  start: AppThemeSpec | null;
  /** Whether the look follows the selected poster theme. */
  follow: boolean;
}

let state: AppThemeState = { active: null, start: null, follow: loadAppThemeFollow() };
const listeners = new Set<() => void>();

function setState(next: AppThemeState) {
  state = next;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function activate(spec: AppThemeSpec | null) {
  if (spec?.id === state.active?.id) return;
  setState({ ...state, active: spec });
  applyAppThemeVars(buildAppThemeVars(spec, getTheme(defaultThemeName).ui.bg));
  if (spec?.titleFont) void ensureFont(spec.titleFont).catch(() => undefined);
}

/** Sets the start look from a theme's "app" section (none = standard look). */
export function setStartAppTheme(themeId: string): void {
  setState({ ...state, start: appThemeFromTheme(themeId) });
}

export function setAppThemeFollow(follow: boolean): void {
  saveAppThemeFollow(follow);
  setState({ ...state, follow });
}

/**
 * Keeps the app's look in step: the start look, or, while it follows the
 * poster theme, that theme's "app" section (none = standard look).
 */
export function useAppThemeSync(posterThemeId: string): void {
  const { follow, start } = useSyncExternalStore(subscribe, () => state);
  useEffect(() => {
    activate(follow ? appThemeFromTheme(posterThemeId) : start);
  }, [follow, start, posterThemeId]);
}

/** The active look's logo and colors, the follow switch, and whether it is offered. */
export function useAppTheme(): {
  logo: string;
  /** The look's own colors (null = the stylesheets' look). */
  colors: { bg: string; text?: string; accent?: string } | null;
  follow: boolean;
  /** Only offered when there is a start look to switch away from. */
  canFollow: boolean;
} {
  const snapshot = useSyncExternalStore(subscribe, () => state);
  return {
    logo: snapshot.active?.logo ?? STANDARD_LOGO,
    colors: snapshot.active
      ? { bg: snapshot.active.bg, text: snapshot.active.text, accent: snapshot.active.accent }
      : null,
    follow: snapshot.follow,
    canFollow: snapshot.start !== null,
  };
}
