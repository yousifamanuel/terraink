import { useCallback } from "react";
import { usePosterContext } from "../ui/PosterContext";
import { computePosterAndFetchBounds } from "@/shared/geo/posterBounds";
import {
  fetchMapData,
  geocodeLocation,
  renderPoster,
  ensureGoogleFont,
} from "@/core/services";
import { parseLocationParts } from "@/shared/utils/location";
import { parseNumericInput } from "@/shared/utils/number";
import { clamp } from "@/shared/geo/math";
import {
  CM_PER_INCH,
  MIN_POSTER_CM,
  MAX_POSTER_CM,
  MIN_DISTANCE_METERS,
  MAX_DISTANCE_METERS,
} from "@/core/config";

/**
 * Extracts the poster generation workflow from App.jsx.
 * Still uses the old lib/ imports for now — once we wire up
 * the infrastructure adapters fully, these will point to
 * the new ports.
 */
export function usePosterGeneration() {
  const { state, dispatch, effectiveTheme, canvasRef, renderCacheRef } =
    usePosterContext();

  const { form } = state;

  /* ── helpers ── */

  function resolveTypography(
    renderCache: NonNullable<typeof renderCacheRef.current>,
  ) {
    return {
      displayCity: form.displayCity.trim() || renderCache.baseCity,
      displayCountry: form.displayCountry.trim() || renderCache.baseCountry,
      fontFamily: form.fontFamily.trim(),
      showPosterText: form.showPosterText !== false,
      includeCredits: form.includeCredits !== false,
    };
  }

  function renderWithCachedMap(
    theme: typeof effectiveTheme,
    typographyOverride?: ReturnType<typeof resolveTypography> | null,
  ) {
    const renderCache = renderCacheRef.current;
    const canvas = canvasRef.current;
    if (!renderCache || !canvas) return null;

    const typography = typographyOverride ?? resolveTypography(renderCache);

    return renderPoster(canvas, {
      theme,
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
  }

  async function runProgressTask<T>(
    startPercent: number,
    endPercent: number,
    message: string,
    task: () => Promise<T>,
  ): Promise<T> {
    const safeStart = clamp(Math.round(startPercent), 0, 100);
    const safeEnd = clamp(Math.round(endPercent), safeStart, 100);
    dispatch({ type: "SET_STATUS", status: message });
    dispatch({ type: "SET_PROGRESS", progress: safeStart });

    let current = safeStart;
    const maxWhileRunning = Math.max(safeStart, safeEnd - 2);
    const stepSize = Math.max(1, Math.round((safeEnd - safeStart) / 8));
    const timerId = window.setInterval(() => {
      current = Math.min(current + stepSize, maxWhileRunning);
      dispatch({ type: "SET_PROGRESS", progress: current });
    }, 250);

    try {
      return await task();
    } finally {
      window.clearInterval(timerId);
      dispatch({ type: "SET_PROGRESS", progress: safeEnd });
    }
  }

  /* ── main generate handler ── */

  const handleGenerate = useCallback(
    async (event?: React.FormEvent) => {
      event?.preventDefault();
      dispatch({ type: "START_GENERATION" });

      try {
        dispatch({ type: "SET_STATUS", status: "Validating input..." });
        dispatch({ type: "SET_PROGRESS", progress: 8 });

        const locationText = form.location.trim();
        const latText = form.latitude.trim();
        const lonText = form.longitude.trim();
        const hasManualCoordinates = Boolean(latText && lonText);

        if (!locationText && (latText || lonText) && !hasManualCoordinates) {
          throw new Error(
            "When location is empty, both latitude and longitude are required.",
          );
        }
        if (!locationText && !hasManualCoordinates) {
          throw new Error(
            "Location is required unless both latitude and longitude are provided.",
          );
        }

        const widthCm = clamp(
          parseNumericInput("Width", form.width),
          MIN_POSTER_CM,
          MAX_POSTER_CM,
        );
        const heightCm = clamp(
          parseNumericInput("Height", form.height),
          MIN_POSTER_CM,
          MAX_POSTER_CM,
        );
        const widthInches = widthCm / CM_PER_INCH;
        const heightInches = heightCm / CM_PER_INCH;
        const distanceMeters = clamp(
          parseNumericInput("Distance", form.distance),
          MIN_DISTANCE_METERS,
          MAX_DISTANCE_METERS,
        );

        const previousLocation =
          renderCacheRef.current?.baseLocation?.trim().toLowerCase() ?? "";
        const locationChanged = locationText.toLowerCase() !== previousLocation;
        const selectedMatchesInput =
          !!state.selectedLocation &&
          state.selectedLocation.label.trim().toLowerCase() ===
            locationText.toLowerCase();
        const fallbackParts = parseLocationParts(locationText);
        const canUseManualCoordinates =
          hasManualCoordinates && (!locationText || !locationChanged);

        let resolvedLocation: any = null;
        let shouldAutofillFromLocation = false;

        if (selectedMatchesInput) {
          resolvedLocation = state.selectedLocation;
          shouldAutofillFromLocation = true;
        } else if (canUseManualCoordinates) {
          resolvedLocation = {
            label: locationText,
            city: fallbackParts.city,
            country: fallbackParts.country,
            lat: parseNumericInput("Latitude", latText),
            lon: parseNumericInput("Longitude", lonText),
          };
        } else {
          resolvedLocation = await runProgressTask(
            12,
            30,
            "Geocoding location...",
            () => geocodeLocation(locationText),
          );
          dispatch({ type: "SELECT_LOCATION", location: resolvedLocation });
          shouldAutofillFromLocation = true;
        }
        dispatch({ type: "SET_PROGRESS", progress: 30 });

        const resolvedCity =
          resolvedLocation.city || fallbackParts.city || locationText;
        const resolvedCountry =
          resolvedLocation.country || fallbackParts.country;

        let displayCity = form.displayCity.trim() || resolvedCity;
        let displayCountry = form.displayCountry.trim() || resolvedCountry;
        if (shouldAutofillFromLocation) {
          displayCity = resolvedCity;
          displayCountry = resolvedCountry;
        }

        const fontFamily = form.fontFamily.trim();
        const showPosterText = form.showPosterText !== false;
        const includeCredits = form.includeCredits !== false;
        const center = {
          lat: resolvedLocation.lat,
          lon: resolvedLocation.lon,
          displayName: resolvedLocation.label || locationText,
        };

        dispatch({
          type: "SET_FORM_FIELDS",
          fields: {
            location: resolvedLocation.label || locationText,
            latitude: resolvedLocation.lat.toFixed(6),
            longitude: resolvedLocation.lon.toFixed(6),
            ...(shouldAutofillFromLocation
              ? { displayCity: resolvedCity, displayCountry: resolvedCountry }
              : {}),
          },
        });

        const aspectRatio = widthInches / heightInches;
        const { posterBounds, fetchBounds } = computePosterAndFetchBounds(
          center,
          distanceMeters,
          aspectRatio,
        );

        const mapData = await runProgressTask(
          35,
          72,
          "Loading OpenStreetMap features...",
          () => fetchMapData(fetchBounds, { buildingBounds: posterBounds }),
        );

        if (
          mapData.roads.length === 0 &&
          mapData.waterPolygons.length === 0 &&
          mapData.parkPolygons.length === 0 &&
          mapData.buildingPolygons.length === 0
        ) {
          throw new Error(
            "No map features were returned for this area. Try a different city or increase distance.",
          );
        }

        if (showPosterText && fontFamily) {
          await runProgressTask(74, 84, "Loading typography...", () =>
            ensureGoogleFont(fontFamily),
          );
        } else {
          dispatch({ type: "SET_PROGRESS", progress: 84 });
        }

        renderCacheRef.current = {
          mapData,
          bounds: posterBounds,
          center,
          widthInches,
          heightInches,
          baseCity: resolvedCity,
          baseCountry: resolvedCountry,
          baseLocation: resolvedLocation.label || locationText,
        };

        dispatch({ type: "SET_STATUS", status: "Rendering poster..." });
        dispatch({ type: "SET_PROGRESS", progress: 90 });

        const size = renderWithCachedMap(effectiveTheme, {
          displayCity,
          displayCountry,
          fontFamily,
          showPosterText,
          includeCredits,
        });

        if (!size) {
          throw new Error("Canvas is not available.");
        }

        dispatch({
          type: "FINISH_GENERATION",
          result: {
            size,
            center,
            roads: mapData.roads.length,
            water: mapData.waterPolygons.length,
            parks: mapData.parkPolygons.length,
            buildings: mapData.buildingPolygons.length,
            widthCm,
            heightCm,
            distanceMeters,
          },
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unexpected error";
        dispatch({ type: "FAIL_GENERATION", error: message });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [form, state.selectedLocation, effectiveTheme],
  );

  return { handleGenerate, renderWithCachedMap, resolveTypography };
}
