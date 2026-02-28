import { useEffect, useState } from "react";

interface UseRepoStarsReturn {
  repoStars: number | null;
  repoStarsLoading: boolean;
}

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

    let cancelled = false;
    const controller = new AbortController();

    async function fetchRepoStars() {
      try {
        setRepoStarsLoading(true);
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
        if (!cancelled && Number.isFinite(stars) && stars >= 0) {
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

    fetchRepoStars();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [repoApiUrl]);

  return { repoStars, repoStarsLoading };
}
