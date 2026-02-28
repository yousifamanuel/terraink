import { useEffect } from "react";
import { usePosterContext } from "../ui/PosterContext";
import { renderPoster, ensureGoogleFont } from "@/core/services";

/**
 * Re-renders the poster canvas whenever theme, typography,
 * or display text changes (without re-fetching map data).
 */
export function usePreviewRenderer() {
  const { state, effectiveTheme, canvasRef, renderCacheRef, dispatch } =
    usePosterContext();

  const { form } = state;

  useEffect(() => {
    const renderCache = renderCacheRef.current;
    if (!renderCache) return;

    const typography = {
      displayCity: form.displayCity.trim() || renderCache.baseCity,
      displayCountry: form.displayCountry.trim() || renderCache.baseCountry,
      fontFamily: form.fontFamily.trim(),
      showPosterText: form.showPosterText !== false,
      includeCredits: form.includeCredits !== false,
    };

    let cancelled = false;

    async function rerenderPreview() {
      const canvas = canvasRef.current;
      if (!canvas || !renderCache) return;

      const size = renderPoster(canvas, {
        theme: effectiveTheme,
        mapData: renderCache.mapData,
        bounds: renderCache.bounds,
        center: renderCache.center,
        widthInches: renderCache.widthInches,
        heightInches: renderCache.heightInches,
        displayCity: typography.displayCity,
        displayCountry: typography.displayCountry,
        fontFamily: typography.fontFamily,
        showPosterText: typography.showPosterText,
        includeCredits: typography.includeCredits,
      });

      if (size) {
        dispatch({ type: "UPDATE_RESULT", patch: { size } });
      }

      if (!typography.showPosterText || !typography.fontFamily) return;

      await ensureGoogleFont(typography.fontFamily);
      if (cancelled) return;

      const refreshedSize = renderPoster(canvas, {
        theme: effectiveTheme,
        mapData: renderCache.mapData,
        bounds: renderCache.bounds,
        center: renderCache.center,
        widthInches: renderCache.widthInches,
        heightInches: renderCache.heightInches,
        displayCity: typography.displayCity,
        displayCountry: typography.displayCountry,
        fontFamily: typography.fontFamily,
        showPosterText: typography.showPosterText,
        includeCredits: typography.includeCredits,
      });

      if (refreshedSize) {
        dispatch({ type: "UPDATE_RESULT", patch: { size: refreshedSize } });
      }
    }

    rerenderPreview();

    return () => {
      cancelled = true;
    };
  }, [
    effectiveTheme,
    form.displayCity,
    form.displayCountry,
    form.fontFamily,
    form.showPosterText,
    form.includeCredits,
  ]);
}
