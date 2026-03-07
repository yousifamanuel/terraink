import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePosterContext } from "@/features/poster/ui/PosterContext";
import { clamp } from "@/shared/geo/math";
import { reverseGeocodeCoordinates } from "@/core/services";
import {
  MIN_DISTANCE_METERS,
  MAX_DISTANCE_METERS,
  EARTH_CIRCUMFERENCE_M,
  TILE_SIZE_PX,
  MIN_MAP_ZOOM,
  MAX_MAP_ZOOM,
  DEFAULT_CONTAINER_PX,
  FLY_TO_DURATION_MS,
} from "@/core/config";
import { MAP_OVERZOOM_SCALE } from "@/features/map/infrastructure/constants";

/**
 * Converts half-width distance (meters) to MapLibre zoom for a given latitude
 * and container width.
 */
export function distanceToZoom(
  distanceMeters: number,
  latDeg: number,
  containerPx: number,
): number {
  const phi = (Math.abs(latDeg) * Math.PI) / 180;
  const cosLat = Math.max(0.01, Math.cos(phi));
  const fullWidth = distanceMeters * 2;
  const zoom = Math.log2(
    (EARTH_CIRCUMFERENCE_M * cosLat * containerPx) / (fullWidth * TILE_SIZE_PX),
  );
  return clamp(zoom, MIN_MAP_ZOOM, MAX_MAP_ZOOM);
}

/**
 * Converts MapLibre zoom back to half-width distance (meters) for form sync.
 */
export function zoomToDistance(
  zoom: number,
  latDeg: number,
  containerPx: number,
): number {
  const phi = (Math.abs(latDeg) * Math.PI) / 180;
  const cosLat = Math.max(0.01, Math.cos(phi));
  const fullWidth =
    (EARTH_CIRCUMFERENCE_M * cosLat * containerPx) /
    (Math.pow(2, zoom) * TILE_SIZE_PX);

  return clamp(
    Math.round(fullWidth / 2),
    MIN_DISTANCE_METERS,
    MAX_DISTANCE_METERS,
  );
}

function resolveZoomBounds(
  latDeg: number,
  containerPx: number,
): { minZoom: number; maxZoom: number } {
  const minZoomFromDistance = distanceToZoom(
    MAX_DISTANCE_METERS,
    latDeg,
    containerPx,
  );
  const maxZoomFromDistance = distanceToZoom(
    MIN_DISTANCE_METERS,
    latDeg,
    containerPx,
  );

  return {
    minZoom: Math.min(minZoomFromDistance, maxZoomFromDistance),
    maxZoom: Math.max(minZoomFromDistance, maxZoomFromDistance),
  };
}

/**
 * Bidirectional synchronization between form fields and MapLibre view.
 */
export function useMapSync() {
  const { state, dispatch, mapRef } = usePosterContext();
  const { form } = state;
  const lastLocationLookupAtRef = useRef(0);
  const lastLookupCoordsRef = useRef<[number, number] | null>(null);
  const latestLocationLookupSeqRef = useRef(0);
  const skippedCoordinateLookupRef = useRef<string>("");
  const lastManualCoordinateLookupRef = useRef<string>("");

  const [containerPx, setContainerPx] = useState(DEFAULT_CONTAINER_PX);
  const effectiveContainerPx = containerPx * MAP_OVERZOOM_SCALE;

  const setContainerWidth = useCallback((px: number) => {
    if (px <= 0) return;

    // Ignore sub-pixel jitter from ResizeObserver.
    setContainerPx((prev) => (Math.abs(prev - px) < 0.5 ? prev : px));
  }, []);

  const formLat = Number(form.latitude) || 0;
  const formLon = Number(form.longitude) || 0;
  const formDistance = clamp(
    Number(form.distance) || MIN_DISTANCE_METERS,
    MIN_DISTANCE_METERS,
    MAX_DISTANCE_METERS,
  );

  const mapZoomBounds = useMemo(
    () => resolveZoomBounds(formLat, effectiveContainerPx),
    [formLat, effectiveContainerPx],
  );

  const mapCenter = useMemo<[number, number]>(
    () => [formLon, formLat],
    [formLon, formLat],
  );

  const mapZoom = useMemo(
    () =>
      clamp(
        distanceToZoom(formDistance, formLat, effectiveContainerPx),
        mapZoomBounds.minZoom,
        mapZoomBounds.maxZoom,
      ),
    [formDistance, formLat, effectiveContainerPx, mapZoomBounds],
  );

  const updateLocationFromCoordinates = useCallback(
    (lat: number, lon: number) => {
      const now = Date.now();
      const previous = lastLookupCoordsRef.current;
      const movedEnough =
        !previous ||
        Math.abs(previous[0] - lat) >= 0.002 ||
        Math.abs(previous[1] - lon) >= 0.002;
      const canLookup = now - lastLocationLookupAtRef.current >= 900;
      if (!movedEnough || !canLookup) {
        return;
      }

      lastLookupCoordsRef.current = [lat, lon];
      lastLocationLookupAtRef.current = now;
      const lookupSeq = ++latestLocationLookupSeqRef.current;

      void reverseGeocodeCoordinates(lat, lon)
        .then((nearest) => {
          if (lookupSeq !== latestLocationLookupSeqRef.current) {
            return;
          }
          const fallbackLabel = String(nearest.label ?? "").trim();
          const nextCity = String(nearest.city ?? "").trim();
          const nextCountry = String(nearest.country ?? "").trim();
          const nextContinent = String(nearest.continent ?? "").trim();
          const nextLocation =
            [nextCity, nextCountry].filter(Boolean).join(", ") || fallbackLabel;

          if (!nextLocation) {
            return;
          }

          dispatch({
            type: "SET_FORM_FIELDS",
            fields: {
              location: nextLocation,
              displayContinent: nextContinent,
              ...(!state.displayNameOverrides.city
                ? { displayCity: nextCity }
                : {}),
              ...(!state.displayNameOverrides.country
                ? { displayCountry: nextCountry }
                : {}),
            },
          });
        })
        .catch(() => {
          // Ignore lookup failures; coordinates stay authoritative.
        });
    },
    [dispatch, state.displayNameOverrides.city, state.displayNameOverrides.country],
  );

  const handleMove = useCallback(
    (center: [number, number]) => {
      const [lon, lat] = center;
      updateLocationFromCoordinates(lat, lon);
    },
    [updateLocationFromCoordinates],
  );

  const handleMoveEnd = useCallback(
    (center: [number, number], zoom: number) => {
      const [lon, lat] = center;
      const bounds = resolveZoomBounds(lat, effectiveContainerPx);
      const boundedZoom = clamp(zoom, bounds.minZoom, bounds.maxZoom);
      const distance = zoomToDistance(boundedZoom, lat, effectiveContainerPx);
      skippedCoordinateLookupRef.current = `${lat.toFixed(6)},${lon.toFixed(6)}`;

      dispatch({
        type: "SET_FORM_FIELDS",
        fields: {
          latitude: lat.toFixed(6),
          longitude: lon.toFixed(6),
          distance: String(Math.round(distance)),
        },
      });

      updateLocationFromCoordinates(lat, lon);
    },
    [dispatch, effectiveContainerPx, updateLocationFromCoordinates],
  );

  useEffect(() => {
    const latText = String(form.latitude ?? "").trim();
    const lonText = String(form.longitude ?? "").trim();
    if (!latText || !lonText || state.selectedLocation) {
      return;
    }

    const lat = Number(latText);
    const lon = Number(lonText);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      return;
    }

    const coordinateKey = `${lat.toFixed(6)},${lon.toFixed(6)}`;
    if (skippedCoordinateLookupRef.current === coordinateKey) {
      skippedCoordinateLookupRef.current = "";
      return;
    }
    if (lastManualCoordinateLookupRef.current === coordinateKey) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      lastManualCoordinateLookupRef.current = coordinateKey;
      updateLocationFromCoordinates(lat, lon);
    }, 350);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [
    form.latitude,
    form.longitude,
    state.selectedLocation,
    updateLocationFromCoordinates,
  ]);

  const flyToLocation = useCallback(
    (lat: number, lon: number, keepCurrentZoom = false) => {
      const map = mapRef.current;
      if (!map) return;

      const bounds = resolveZoomBounds(lat, effectiveContainerPx);
      const zoom = keepCurrentZoom
        ? clamp(map.getZoom(), bounds.minZoom, bounds.maxZoom)
        : clamp(
            distanceToZoom(formDistance, lat, effectiveContainerPx),
            bounds.minZoom,
            bounds.maxZoom,
          );

      map.flyTo({
        center: [lon, lat],
        zoom,
        duration: FLY_TO_DURATION_MS,
      });
    },
    [mapRef, formDistance, effectiveContainerPx],
  );

  return {
    mapCenter,
    mapZoom,
    mapMinZoom: mapZoomBounds.minZoom,
    mapMaxZoom: mapZoomBounds.maxZoom,
    handleMove,
    handleMoveEnd,
    flyToLocation,
    setContainerWidth,
  };
}
