import type { ICache } from "./ports";

const CACHE_PREFIX = "terraink:v3:";
const DEFAULT_MAX_AGE_MS = 6 * 60 * 60 * 1000;

export const localStorageCache: ICache = {
  read<T = unknown>(
    key: string,
    maxAgeMs: number = DEFAULT_MAX_AGE_MS,
  ): T | null {
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

      return (payload.data as T) ?? null;
    } catch {
      return null;
    }
  },

  write(key: string, data: unknown): void {
    if (typeof window === "undefined" || !window.localStorage) {
      return;
    }

    try {
      const cacheKey = `${CACHE_PREFIX}${key}`;
      window.localStorage.setItem(
        cacheKey,
        JSON.stringify({ ts: Date.now(), data }),
      );
    } catch {
      // Ignore localStorage errors (quota, private mode, etc.)
    }
  },
};
