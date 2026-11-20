const FOLLOW_KEY = "terraink:app-theme-follow";
let appliedNames: string[] = [];

/** Puts the app theme's CSS variables on <html>, replacing the previous set. */
export function applyAppThemeVars(vars: Record<string, string>): void {
  const root = document.documentElement;
  for (const name of appliedNames) root.style.removeProperty(name);
  for (const [name, value] of Object.entries(vars)) root.style.setProperty(name, value);
  appliedNames = Object.keys(vars);
}

/** Whether the app look follows the selected poster theme (on by default). */
export function loadAppThemeFollow(): boolean {
  try {
    return window.localStorage.getItem(FOLLOW_KEY) !== "0";
  } catch {
    return true;
  }
}

export function saveAppThemeFollow(follow: boolean): void {
  try {
    if (follow) window.localStorage.removeItem(FOLLOW_KEY);
    else window.localStorage.setItem(FOLLOW_KEY, "0");
  } catch {
    // Storage blocked (private mode): the choice lasts for this visit.
  }
}
