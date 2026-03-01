import { useCallback, useMemo, useState } from "react";
import { usePosterContext } from "@/features/poster/ui/PosterContext";
import { clamp } from "@/shared/geo/math";
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

  const [containerPx, setContainerPx] = useState(DEFAULT_CONTAINER_PX);

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
    () => resolveZoomBounds(formLat, containerPx),
    [formLat, containerPx],
  );

  const mapCenter = useMemo<[number, number]>(
    () => [formLon, formLat],
    [formLon, formLat],
  );

  const mapZoom = useMemo(
    () =>
      clamp(
        distanceToZoom(formDistance, formLat, containerPx),
        mapZoomBounds.minZoom,
        mapZoomBounds.maxZoom,
      ),
    [formDistance, formLat, containerPx, mapZoomBounds],
  );

  const handleMoveEnd = useCallback(
    (center: [number, number], zoom: number) => {
      const [lon, lat] = center;
      const bounds = resolveZoomBounds(lat, containerPx);
      const boundedZoom = clamp(zoom, bounds.minZoom, bounds.maxZoom);
      const distance = zoomToDistance(boundedZoom, lat, containerPx);

      dispatch({
        type: "SET_FORM_FIELDS",
        fields: {
          latitude: lat.toFixed(6),
          longitude: lon.toFixed(6),
          distance: String(distance),
        },
      });
    },
    [dispatch, containerPx],
  );

  const flyToLocation = useCallback(
    (lat: number, lon: number) => {
      const map = mapRef.current;
      if (!map) return;

      const bounds = resolveZoomBounds(lat, containerPx);
      const zoom = clamp(
        distanceToZoom(formDistance, lat, containerPx),
        bounds.minZoom,
        bounds.maxZoom,
      );

      map.flyTo({
        center: [lon, lat],
        zoom,
        duration: FLY_TO_DURATION_MS,
      });
    },
    [mapRef, formDistance, containerPx],
  );

  return {
    mapCenter,
    mapZoom,
    mapMinZoom: mapZoomBounds.minZoom,
    mapMaxZoom: mapZoomBounds.maxZoom,
    handleMoveEnd,
    flyToLocation,
    setContainerWidth,
  };
}
