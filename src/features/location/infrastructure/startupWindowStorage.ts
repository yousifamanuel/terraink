/**
 * Whether the startup location window is shown. A fixed key (no app version
 * in it), so the choice survives app updates.
 */
const STORAGE_KEY = "terraink:startup-window-hidden";

export function loadStartupWindowHidden(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function saveStartupWindowHidden(hidden: boolean): void {
  try {
    if (hidden) window.localStorage.setItem(STORAGE_KEY, "1");
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage blocked (private mode): the window simply shows again.
  }
}
