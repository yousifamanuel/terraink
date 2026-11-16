import { useCallback, useState } from "react";
import { loadFavoriteThemeIds, saveFavoriteThemeIds } from "@/core/services";

/** Favorite themes, newest first, remembered in this browser. */
export function useFavoriteThemes() {
  const [favoriteIds, setFavoriteIds] = useState<string[]>(loadFavoriteThemeIds);

  const toggleFavorite = useCallback((id: string) => {
    setFavoriteIds((current) => {
      const next = current.includes(id)
        ? current.filter((item) => item !== id)
        : [id, ...current];
      saveFavoriteThemeIds(next);
      return next;
    });
  }, []);

  return { favoriteIds, toggleFavorite };
}
