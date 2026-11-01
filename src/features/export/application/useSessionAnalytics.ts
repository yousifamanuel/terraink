import { useEffect } from "react";
import { trackEvent } from "@/core/services";

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

    const displayMode =
      document.documentElement.dataset.displayMode === "standalone"
        ? "standalone"
        : "browser";
    trackEvent("app_open", { display_mode: displayMode });
  }, []);
}
