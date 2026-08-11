import { useEffect } from "react";
import { fetchLocationBoundary } from "@/core/services";
import { resolveBoundaryTolerance } from "@/features/location/domain/boundary";
import type { SearchResult } from "@/features/location/domain/types";
import type { PosterAction } from "@/features/poster/application/posterReducer";

/**
 * Keeps the administrative outline of the selected location in state while the
 * boundary clip is enabled.
 *
 * A boundary is only available for locations picked from search, since the
 * lookup keys off the OSM element the suggestion resolved to. Typed
 * coordinates and map drags have nothing to look up.
 */
export function useLocationBoundary(
  enabled: boolean,
  selectedLocation: SearchResult | null,
  distanceMeters: number,
  dispatch: React.Dispatch<PosterAction>,
): void {
  useEffect(() => {
    if (!enabled || !selectedLocation) {
      dispatch({ type: "SET_LOCATION_BOUNDARY", boundary: null, status: "idle" });
      return;
    }

    let isCancelled = false;
    dispatch({ type: "SET_LOCATION_BOUNDARY", boundary: null, status: "loading" });

    void fetchLocationBoundary(
      selectedLocation,
      resolveBoundaryTolerance(distanceMeters),
    )
      .then((boundary) => {
        if (isCancelled) return;
        dispatch({
          type: "SET_LOCATION_BOUNDARY",
          boundary,
          status: boundary ? "ready" : "unavailable",
        });
      })
      .catch(() => {
        if (isCancelled) return;
        // A failed lookup leaves the poster unclipped rather than blocking it.
        dispatch({
          type: "SET_LOCATION_BOUNDARY",
          boundary: null,
          status: "unavailable",
        });
      });

    return () => {
      isCancelled = true;
    };
  }, [enabled, selectedLocation, distanceMeters, dispatch]);
}
