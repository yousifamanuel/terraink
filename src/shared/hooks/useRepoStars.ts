import { useEffect, useState } from "react";

interface UseRepoStarsReturn {
  repoStars: number | null;
  repoStarsLoading: boolean;
}

const REPO_STARS_CACHE_PREFIX = "terraink.repoStars.";
const memoryStarsCache = new Map<string, number>();
const inFlightRequests = new Map<string, Promise<number | null>>();

function normalizeToApiUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    // Already an API URL
    if (parsed.hostname.includes("api.github.com")) return url;

    // If it's a github.com repo page, build the API URL
    if (parsed.hostname.includes("github.com")) {
      const parts = parsed.pathname.split("/").filter(Boolean);
      if (parts.length >= 2) {
        const owner = parts[0];
        const repo = parts[1];
        return `https://api.github.com/repos/${owner}/${repo}`;
      }
    }
    return null;
  } catch {
    return null;
  }
}

function getStorageKey(apiUrl: string): string {
  return `${REPO_STARS_CACHE_PREFIX}${encodeURIComponent(apiUrl)}`;
}

function readCachedStars(apiUrl: string): number | null {
  const cachedInMemory = memoryStarsCache.get(apiUrl);
  if (typeof cachedInMemory === "number") {
    return cachedInMemory;
  }

  if (typeof window === "undefined" || !window.localStorage) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(getStorageKey(apiUrl));
    const parsed = Number(raw);
    if (Number.isFinite(parsed) && parsed >= 0) {
      const normalized = Math.floor(parsed);
      memoryStarsCache.set(apiUrl, normalized);
      return normalized;
    }
  } catch {
    // Ignore cache read failures.
  }

  return null;
}

const MEMORY_CACHE_MAX = 50;

function writeCachedStars(apiUrl: string, stars: number): void {
  if (memoryStarsCache.size >= MEMORY_CACHE_MAX) {
    memoryStarsCache.clear();
  }
  memoryStarsCache.set(apiUrl, stars);

  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }

  try {
    window.localStorage.setItem(getStorageKey(apiUrl), String(stars));
  } catch {
    // Ignore cache write failures.
  }
}

export function useRepoStars(repoApiUrl: string): UseRepoStarsReturn {
  const [repoStars, setRepoStars] = useState<number | null>(null);
  const [repoStarsLoading, setRepoStarsLoading] = useState(true);

  useEffect(() => {
    const finalUrl = normalizeToApiUrl(repoApiUrl);
    if (!finalUrl) {
      setRepoStars(null);
      setRepoStarsLoading(false);
      return undefined;
    }

    const cachedStars = readCachedStars(finalUrl);
    if (cachedStars !== null) {
      setRepoStars(cachedStars);
      setRepoStarsLoading(false);
    }

    let cancelled = false;

    async function fetchRepoStars() {
      let request = inFlightRequests.get(finalUrl);
      if (!request) {
        request = (async () => {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 20_000);
          try {
            const response = await fetch(finalUrl, {
              headers: {
                Accept: "application/vnd.github+json",
              },
              signal: controller.signal,
            });

            if (!response.ok) {
              throw new Error(`GitHub API failed with HTTP ${response.status}`);
            }

            const payload = await response.json();
            const stars = Number(payload?.stargazers_count);
            if (Number.isFinite(stars) && stars >= 0) {
              const normalized = Math.floor(stars);
              writeCachedStars(finalUrl, normalized);
              return normalized;
            }

            return null;
          } catch {
            return null;
          } finally {
            clearTimeout(timer);
            inFlightRequests.delete(finalUrl);
          }
        })();
        inFlightRequests.set(finalUrl, request);
      }

      try {
        if (cachedStars === null) {
          setRepoStarsLoading(true);
        }
        const stars = await request;
        if (!cancelled && stars !== null) {
          setRepoStars(stars);
        }
      } catch {
        if (!cancelled) {
          setRepoStars(null);
        }
      } finally {
        if (!cancelled) {
          setRepoStarsLoading(false);
        }
      }
    }

    void fetchRepoStars();

    return () => {
      cancelled = true;
    };
  }, [repoApiUrl]);

  return { repoStars, repoStarsLoading };
}
