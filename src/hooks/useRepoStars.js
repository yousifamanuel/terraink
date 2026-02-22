import { useEffect, useState } from "react";

export function useRepoStars(repoApiUrl) {
  const [repoStars, setRepoStars] = useState(null);
  const [repoStarsLoading, setRepoStarsLoading] = useState(true);

  useEffect(() => {
    if (!repoApiUrl) {
      setRepoStars(null);
      setRepoStarsLoading(false);
      return undefined;
    }

    let cancelled = false;
    const controller = new AbortController();

    async function fetchRepoStars() {
      try {
        setRepoStarsLoading(true);
        const response = await fetch(repoApiUrl, {
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

  return {
    repoStars,
    repoStarsLoading,
  };
}
