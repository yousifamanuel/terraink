import { ADSENSE_AD_CLIENT } from "@/core/config";

let requested = false;

/**
 * Adds the AdSense script once. Called after the startup window closes (or
 * right away when it is skipped), so no ad loads hidden behind the window.
 * Ad slots queue their requests and fill as soon as the script is ready.
 */
export function loadAds(): void {
  const client = String(ADSENSE_AD_CLIENT ?? "").trim();
  if (requested || !client || typeof document === "undefined") return;
  requested = true;
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(client)}`;
  script.crossOrigin = "anonymous";
  document.head.appendChild(script);
}
