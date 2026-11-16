import { useEffect } from "react";
import { trackEvent } from "@/core/services";

/** "standalone" when opened as an installed app, else "browser". */
export function getDisplayMode(): "standalone" | "browser" {
  return document.documentElement.dataset.displayMode === "standalone"
    ? "standalone"
    : "browser";
}

// Sample once per page load, not per component remount.
let reported = false;

/**
 * Fires once-per-session analytics on app load for every visitor: `app_open`
 * with the display mode (standalone PWA vs browser tab). Aggregate and
 * non-personal.
 */
export function useSessionAnalytics(): void {
  useEffect(() => {
    if (reported) return;
    reported = true;

    trackEvent("app_open", { display_mode: getDisplayMode() });
  }, []);
}
