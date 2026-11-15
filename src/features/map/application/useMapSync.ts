import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { clamp, haversineMeters } from "@/shared/geo/math";
import { reverseGeocodeCoordinates } from "@/core/services";
import type { MapInstanceRef } from "@/features/map/domain/types";
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
import {
  MAP_OVERZOOM_SCALE,
  MIN_EFFECTIVE_CONTAINER_PX,
  MAX_OVERZOOM_SCALE,
} from "@/features/map/infrastructure/constants";

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

interface MapSyncState {
  form: { latitude: string; longitude: string; distance: string };
  displayNameOverrides: { city: boolean; country: boolean };
  selectedLocation: { label?: string; city?: string; country?: string; continent?: string } | null;
}

type MapSyncDispatch = (
  action:
    | {
        type: "SET_FORM_FIELDS";
        fields: Partial<Record<string, string>>;
        resetDisplayNameOverrides?: boolean;
      }
    | { type: "SET_LOCATION_LOOKUP_PENDING"; pending: boolean },
) => void;

/**
 * Bidirectional synchronization between form fields and MapLibre view.
 */
/** Wait this long after the map stops before asking for the place name. */
const MAP_REST_LOOKUP_MS = 2000;

/**
 * Keep the current name until the map has moved this share of the poster
 * width (default view ≈ 8 km wide → 2 km), but at least 1 km.
 */
const NAME_UPDATE_SHARE_OF_WIDTH = 0.25;
const NAME_UPDATE_MIN_M = 1000;

/*
 * One place-name lookup state for the whole app. useMapSync runs in several
 * components (preview, location bar, settings); per-instance refs let a late
 * answer from one overwrite a name another had just set.
 */
const nameLookup = {
  timer: undefined as number | undefined,
  /** Bumped to discard answers that are still on their way. */
  seq: 0,
  /** Where the current name was found (or set by a search/recenter). */
  coords: null as [number, number] | null,
  /** Coordinates set by the map or the app itself, not typed by the user. */
  knownKey: "",
  /** Last typed coordinates already looked up. */
  typedKey: "",
};

const coordinateKey = (lat: number, lon: number) => `${lat.toFixed(6)},${lon.toFixed(6)}`;

export function useMapSync(
  state: MapSyncState,
  dispatch: MapSyncDispatch,
  mapRef: MapInstanceRef,
) {
  const { form } = state;
  // Read selectedLocation without adding it to the coordinate effect's deps.
  // The effect should only re-run when lat/lon change (user typed coordinates),
  // not when selectedLocation changes (e.g. CLEAR_LOCATION) — otherwise clearing
  // a location immediately reverse-geocodes the same coords and refills the field.
  const selectedLocationRef = useRef(state.selectedLocation);
  selectedLocationRef.current = state.selectedLocation;

  const [containerPx, setContainerPx] = useState(DEFAULT_CONTAINER_PX);

  // Scale up so small viewports reach the same effective width (and thus
  // the same MapLibre zoom / tile detail level) as desktop.
  const overzoomScale = Math.min(
    MAX_OVERZOOM_SCALE,
    Math.max(MAP_OVERZOOM_SCALE, MIN_EFFECTIVE_CONTAINER_PX / containerPx),
  );
  const effectiveContainerPx = containerPx * overzoomScale;

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

  // Poster width = 2 × distance (see distanceToZoom).
  const nameUpdateDistanceRef = useRef(NAME_UPDATE_MIN_M);
  nameUpdateDistanceRef.current = Math.max(
    NAME_UPDATE_MIN_M,
    formDistance * 2 * NAME_UPDATE_SHARE_OF_WIDTH,
  );

  const lookupLocationName = useCallback(
    (lat: number, lon: number, force = false) => {
      const previous = nameLookup.coords;
      const movedEnough =
        force ||
        !previous ||
        haversineMeters(
          { lat: previous[0], lon: previous[1] },
          { lat, lon },
        ) >= nameUpdateDistanceRef.current;
      if (!movedEnough) {
        dispatch({ type: "SET_LOCATION_LOOKUP_PENDING", pending: false });
        return;
      }

      nameLookup.coords = [lat, lon];
      const lookupSeq = ++nameLookup.seq;

      void reverseGeocodeCoordinates(lat, lon)
        .then((nearest) => {
          if (lookupSeq !== nameLookup.seq) {
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
              // Place names always follow the map; text the user typed
              // lives in posterTitle / posterSubtitle.
              displayCity: nextCity,
              displayCountry: nextCountry,
              displayContinent: nextContinent,
            },
          });
        })
        .catch(() => {
          // Ignore lookup failures; coordinates stay authoritative.
        })
        .finally(() => {
          if (lookupSeq === nameLookup.seq) {
            dispatch({ type: "SET_LOCATION_LOOKUP_PENDING", pending: false });
          }
        });
    },
    [dispatch],
  );

  // Look up the place name only once the map has rested for this long,
  // so panning around doesn't send a request per stop.
  const updateLocationFromCoordinates = useCallback(
    (lat: number, lon: number, delayMs = MAP_REST_LOOKUP_MS, force = false) => {
      window.clearTimeout(nameLookup.timer);
      // Small moves keep the name: no spinner, no request.
      const previous = nameLookup.coords;
      if (
        !force &&
        previous &&
        haversineMeters({ lat: previous[0], lon: previous[1] }, { lat, lon }) <
          nameUpdateDistanceRef.current
      ) {
        nameLookup.timer = undefined;
        dispatch({ type: "SET_LOCATION_LOOKUP_PENDING", pending: false });
        return;
      }
      dispatch({ type: "SET_LOCATION_LOOKUP_PENDING", pending: true });
      nameLookup.timer = window.setTimeout(() => {
        nameLookup.timer = undefined;
        lookupLocationName(lat, lon, force);
      }, delayMs);
    },
    [dispatch, lookupLocationName],
  );

  // On start, the shown name belongs to the starting position.
  useEffect(() => {
    if (nameLookup.coords || !form.latitude || !form.longitude) return;
    const lat = Number(form.latitude);
    const lon = Number(form.longitude);
    if (Number.isFinite(lat) && Number.isFinite(lon)) nameLookup.coords = [lat, lon];
  }, [form.latitude, form.longitude]);

  /**
   * The name for (lat, lon) is already known (search pick, recenter): cancel
   * any waiting lookup and ignore answers still on their way.
   */
  const settleLocationName = useCallback(
    (lat: number, lon: number) => {
      window.clearTimeout(nameLookup.timer);
      nameLookup.timer = undefined;
      nameLookup.seq++;
      nameLookup.coords = [lat, lon];
      nameLookup.knownKey = coordinateKey(lat, lon);
      dispatch({ type: "SET_LOCATION_LOOKUP_PENDING", pending: false });
    },
    [dispatch],
  );

  const handleMove = useCallback(
    (_center: [number, number]) => {
      // Reverse geocode is deferred to handleMoveEnd to avoid firing on every frame.
    },
    [],
  );

  const handleMoveEnd = useCallback(
    (center: [number, number], zoom: number) => {
      const [lon, lat] = center;
      const bounds = resolveZoomBounds(lat, effectiveContainerPx);
      const boundedZoom = clamp(zoom, bounds.minZoom, bounds.maxZoom);
      const distance = zoomToDistance(boundedZoom, lat, effectiveContainerPx);
      nameLookup.knownKey = coordinateKey(lat, lon);

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
    if (!latText || !lonText || selectedLocationRef.current) {
      return;
    }

    const lat = Number(latText);
    const lon = Number(lonText);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      return;
    }

    // Only coordinates the user typed; every copy of this hook sees the change.
    const key = coordinateKey(lat, lon);
    if (key === nameLookup.knownKey || key === nameLookup.typedKey) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      if (nameLookup.typedKey === key) return;
      nameLookup.typedKey = key;
      // Typed coordinates always get a fresh name.
      updateLocationFromCoordinates(lat, lon, 1000, true);
    }, 350);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [form.latitude, form.longitude, updateLocationFromCoordinates]);

  const flyToLocation = useCallback(
    (lat: number, lon: number, keepCurrentZoom = false) => {
      const map = mapRef.current;
      if (!map) return;
      settleLocationName(lat, lon);

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
    [mapRef, formDistance, effectiveContainerPx, settleLocationName],
  );

  return {
    mapCenter,
    mapZoom,
    mapMinZoom: mapZoomBounds.minZoom,
    mapMaxZoom: mapZoomBounds.maxZoom,
    handleMove,
    handleMoveEnd,
    flyToLocation,
    settleLocationName,
    setContainerWidth,
    overzoomScale,
  };
}
