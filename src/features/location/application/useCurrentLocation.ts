import { useCallback, useEffect, useRef, useState } from "react";
import { usePosterDispatch } from "@/features/poster/ui/PosterContext";
import { reverseGeocodeCoordinates } from "@/core/services";
import { DEFAULT_DISTANCE_METERS } from "@/core/config";
import { GEOLOCATION_TIMEOUT_MS } from "@/features/map/infrastructure";
import {
  getGeolocationFailureMessage,
  requestCurrentPositionWithRetry,
} from "@/features/location/infrastructure";
import type { SearchResult } from "@/features/location/domain/types";

interface UseCurrentLocationReturn {
  handleUseCurrentLocation: () => void;
  isLocatingUser: boolean;
  locationPermissionMessage: string;
  dismissLocationPermissionMessage: () => void;
}

const LOCATION_MESSAGE_HIDE_MS = 5000;

export function useCurrentLocation(
  flyToLocation: (lat: number, lon: number) => void,
): UseCurrentLocationReturn {
  const { dispatch } = usePosterDispatch();
  const [isLocatingUser, setIsLocatingUser] = useState(false);
  const isLocatingRef = useRef(false);
  const [locationPermissionMessage, setLocationPermissionMessage] =
    useState("");

  // The message covers the panel below it, so it hides itself after a while.
  useEffect(() => {
    if (!locationPermissionMessage) return;
    const timer = window.setTimeout(
      () => setLocationPermissionMessage(""),
      LOCATION_MESSAGE_HIDE_MS,
    );
    return () => window.clearTimeout(timer);
  }, [locationPermissionMessage]);

  const handleUseCurrentLocation = useCallback(() => {
    if (isLocatingRef.current) return;
    isLocatingRef.current = true;

    setIsLocatingUser(true);
    void (async () => {
      // requestCurrentPositionWithRetry never throws — it always returns a result.
      // Checking ok outside the try block lets TypeScript narrow the discriminated union.
      const positionResult = await requestCurrentPositionWithRetry({
        timeoutMs: GEOLOCATION_TIMEOUT_MS,
        maxAttempts: 2,
      });

      if ("reason" in positionResult) {
        setLocationPermissionMessage(
          getGeolocationFailureMessage(positionResult.reason),
        );
        isLocatingRef.current = false;
        setIsLocatingUser(false);
        return;
      }

      const { lat, lon } = positionResult;
      setLocationPermissionMessage("");

      try {
        flyToLocation(lat, lon);
        dispatch({
          type: "SET_FORM_FIELDS",
          resetDisplayNameOverrides: true,
          fields: {
            latitude: lat.toFixed(6),
            longitude: lon.toFixed(6),
            distance: String(DEFAULT_DISTANCE_METERS),
          },
        });

        try {
          const resolved = await reverseGeocodeCoordinates(lat, lon);
          dispatch({
            type: "SET_FORM_FIELDS",
            resetDisplayNameOverrides: true,
            fields: {
              location: resolved.label,
              displayCity: String(resolved.city ?? "").trim(),
              displayCountry: String(resolved.country ?? "").trim(),
              displayContinent: String(resolved.continent ?? "").trim(),
            },
          });
          dispatch({ type: "SET_USER_LOCATION", location: resolved });
        } catch {
          const fallback: SearchResult = {
            id: `user:${lat.toFixed(6)},${lon.toFixed(6)}`,
            label: `${lat.toFixed(6)}, ${lon.toFixed(6)}`,
            city: "",
            country: "",
            continent: "",
            lat,
            lon,
          };
          dispatch({
            type: "SET_FORM_FIELDS",
            resetDisplayNameOverrides: true,
            fields: { location: fallback.label },
          });
          dispatch({ type: "SET_USER_LOCATION", location: fallback });
        }
      } finally {
        isLocatingRef.current = false;
        setIsLocatingUser(false);
      }
    })();
  }, [flyToLocation, dispatch]);

  const dismissLocationPermissionMessage = useCallback(
    () => setLocationPermissionMessage(""),
    [],
  );

  return {
    handleUseCurrentLocation,
    isLocatingUser,
    locationPermissionMessage,
    dismissLocationPermissionMessage,
  };
}
