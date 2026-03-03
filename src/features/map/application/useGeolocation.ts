import { useEffect } from "react";
import {
  DEFAULT_LAT,
  DEFAULT_LON,
  DEFAULT_CITY,
  DEFAULT_COUNTRY,
} from "@/core/config";
import { GEOLOCATION_TIMEOUT_MS } from "@/features/map/infrastructure";
import type { PosterAction } from "@/features/poster/application/posterReducer";
import { reverseGeocodeCoordinates } from "@/core/services";

/**
 * Initializes map start position from browser geolocation.
 * Falls back to Hanover coordinates when geolocation is unavailable or denied.
 */
export function useGeolocation(dispatch: React.Dispatch<PosterAction>) {
  useEffect(() => {
    let cancelled = false;
    const defaultLocationLabel =
      "Hanover, Region Hannover, Lower Saxony, Germany";

    const applyFallback = () => {
      if (cancelled) return;
      dispatch({ type: "SET_USER_LOCATION", location: null });
      dispatch({
        type: "SET_FORM_FIELDS",
        fields: {
          location: defaultLocationLabel,
          latitude: DEFAULT_LAT.toFixed(6),
          longitude: DEFAULT_LON.toFixed(6),
          displayCity: DEFAULT_CITY,
          displayCountry: DEFAULT_COUNTRY,
          displayContinent: "Europe",
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
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        dispatch({
          type: "SET_FORM_FIELDS",
          fields: {
            latitude: lat.toFixed(6),
            longitude: lon.toFixed(6),
          },
        });
        dispatch({
          type: "SET_USER_LOCATION",
          location: {
            id: `user:${lat.toFixed(6)},${lon.toFixed(6)}`,
            label: "Current Location",
            city: "",
            country: "",
            continent: "",
            lat,
            lon,
          },
        });

        void reverseGeocodeCoordinates(lat, lon)
          .then((nearest) => {
            if (cancelled) return;

            const city = String(nearest.city ?? "").trim();
            const country = String(nearest.country ?? "").trim();
            const label =
              [city, country].filter(Boolean).join(", ") ||
              String(nearest.label ?? "").trim();
            const continent = String(nearest.continent ?? "").trim();
            if (!label) return;

            dispatch({
              type: "SET_FORM_FIELDS",
              fields: {
                location: label,
                displayCity: city,
                displayCountry: country,
                displayContinent: continent,
              },
            });
            dispatch({ type: "SET_USER_LOCATION", location: nearest });
          })
          .catch(() => {
            // Keep coordinate update even when reverse lookup fails.
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
