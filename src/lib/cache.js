const CACHE_PREFIX = "maptoposter-web:v3:";

export function readCache(key, maxAgeMs = 6 * 60 * 60 * 1000) {
  if (typeof window === "undefined" || !window.localStorage) {
    return null;
  }

  try {
    const cacheKey = `${CACHE_PREFIX}${key}`;
    const raw = window.localStorage.getItem(cacheKey);
    if (!raw) {
      return null;
    }

    const payload = JSON.parse(raw);
    if (
      !payload ||
      typeof payload !== "object" ||
      typeof payload.ts !== "number"
    ) {
      window.localStorage.removeItem(cacheKey);
      return null;
    }

    if (Date.now() - payload.ts > maxAgeMs) {
      window.localStorage.removeItem(cacheKey);
      return null;
    }

    return payload.data ?? null;
  } catch {
    return null;
  }
}

export function writeCache(key, data) {
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }

  try {
    const cacheKey = `${CACHE_PREFIX}${key}`;
    window.localStorage.setItem(
      cacheKey,
      JSON.stringify({
        ts: Date.now(),
        data,
      })
    );
  } catch {
    // Ignore localStorage errors (quota, private mode, etc.)
  }
}
