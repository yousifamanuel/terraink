/**
 * Minimal GA4 event wrapper.
 *
 * The gtag loader lives in index.html; this is the single place app code
 * emits events, so features go through core/services rather than touching
 * window.gtag directly. Fails silently — analytics must never break the app
 * (and gtag itself may be absent when blocked).
 */
type AnalyticsParams = Record<string, string | number | boolean>;

type Gtag = (
  command: "event" | "set",
  actionOrTarget: string,
  params?: AnalyticsParams | { user_properties: AnalyticsParams },
) => void;

function getGtag(): Gtag | null {
  const gtag = (window as unknown as { gtag?: Gtag }).gtag;
  return typeof gtag === "function" ? gtag : null;
}

export function trackEvent(name: string, params?: AnalyticsParams): void {
  const gtag = getGtag();
  if (!gtag) return;
  try {
    gtag("event", name, params);
  } catch {
    // ignore
  }
}

/**
 * Sets a GA4 user property — attached to this user going forward until
 * changed, unlike trackEvent params which are a point-in-time log entry.
 * Use for "current total" style values (e.g. lifetime export count), not
 * for per-occurrence data.
 */
export function setUserProperty(name: string, value: AnalyticsParams[string]): void {
  const gtag = getGtag();
  if (!gtag) return;
  try {
    gtag("set", "user_properties", { [name]: value });
  } catch {
    // ignore
  }
}
