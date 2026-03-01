import { useEffect } from "react";
import {
  DEFAULT_LAT,
  DEFAULT_LON,
  DEFAULT_CITY,
  DEFAULT_COUNTRY,
} from "@/core/config";
import { GEOLOCATION_TIMEOUT_MS } from "@/features/map/infrastructure";
import type { PosterAction } from "@/features/poster/application/posterReducer";

/**
 * Initializes map start position from browser geolocation.
 * Falls back to Hanover coordinates when geolocation is unavailable or denied.
 */
export function useGeolocation(dispatch: React.Dispatch<PosterAction>) {
  useEffect(() => {
    let cancelled = false;

    const applyFallback = () => {
      if (cancelled) return;
      dispatch({
        type: "SET_FORM_FIELDS",
        fields: {
          location: "",
          latitude: DEFAULT_LAT.toFixed(6),
          longitude: DEFAULT_LON.toFixed(6),
          displayCity: DEFAULT_CITY,
          displayCountry: DEFAULT_COUNTRY,
        },
      });
    };

    if (!navigator.geolocation) {
      applyFallback();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (cancelled) return;
        dispatch({
          type: "SET_FORM_FIELDS",
          fields: {
            latitude: position.coords.latitude.toFixed(6),
            longitude: position.coords.longitude.toFixed(6),
          },
        });
      },
      () => {
        applyFallback();
      },
      {
        enableHighAccuracy: false,
        timeout: GEOLOCATION_TIMEOUT_MS,
        maximumAge: Infinity,
      },
    );

    return () => {
      cancelled = true;
    };
  }, [dispatch]);
}
