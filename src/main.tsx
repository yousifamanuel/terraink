import React from "react";
import ReactDOM from "react-dom/client";
import { isNativePlatform, onPlatformAdapterChange } from "@/core/platform";
import App from "./App";

// Self-hosted UI typefaces. These replace the Google Fonts stylesheet that
// base.css used to @import, which leaked visitor IPs to Google on every load.
// Weights mirror that stylesheet exactly, so rendering is unchanged.
import "@fontsource/instrument-sans/400.css";
import "@fontsource/instrument-sans/500.css";
import "@fontsource/instrument-sans/600.css";
import "@fontsource/instrument-sans/700.css";
import "@fontsource/spline-sans-mono/400.css";
import "@fontsource/spline-sans-mono/500.css";
import "@fontsource/bebas-neue/400.css";

// Default poster typefaces. Every poster falls back to these when no custom
// font is chosen, but nothing ever loaded them — until now they silently
// degraded to the generic sans/mono stack. Weights match preview.css.
import "@fontsource/space-grotesk/300.css";
import "@fontsource/space-grotesk/400.css";
import "@fontsource/space-grotesk/700.css";
import "@fontsource/ibm-plex-mono/300.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/700.css";

import "./styles/index.css";

const syncDisplayMode = () => {
  const isStandalone =
    isNativePlatform() ||
    !!(window as unknown as Record<string, unknown>).Capacitor ||
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari PWA fallback.
    (window.navigator as Navigator & { standalone?: boolean }).standalone ===
      true;

  document.documentElement.dataset.displayMode = isStandalone
    ? "standalone"
    : "browser";
};

syncDisplayMode();
onPlatformAdapterChange(syncDisplayMode);
const displayModeQuery = window.matchMedia("(display-mode: standalone)");
if (typeof displayModeQuery.addEventListener === "function") {
  displayModeQuery.addEventListener("change", syncDisplayMode);
} else {
  displayModeQuery.onchange = syncDisplayMode;
}

if ("serviceWorker" in navigator && !isNativePlatform()) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((error) => {
      console.warn("Service worker registration failed", error);
    });
  });
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
