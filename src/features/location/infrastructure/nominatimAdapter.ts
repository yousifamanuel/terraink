import type { ICache } from "@/core/cache/ports";
import type { IHttp } from "@/core/http/ports";
import type { IGeocodePort } from "../domain/ports";
import type { Location, LocationBoundary, SearchResult } from "../domain/types";
import {
  normalizeLocationResult,
  parseBoundaryRings,
  parseLocationResponseItems,
} from "./locationParser";
import { GEOCODE_TTL_MS, LOCATION_SEARCH_TTL_MS } from "./constants";
import {
  getBoundaryCacheKey,
  getGeocodeCacheKey,
  getLocationSearchCacheKey,
  getReverseGeocodeCacheKey,
} from "./cacheKeys";

/** Nominatim `osm_ids` uses a single-letter prefix per OSM element type. */
const OSM_TYPE_PREFIXES: Record<string, string> = {
  relation: "R",
  way: "W",
  node: "N",
};

/**
 * Outlines share the localStorage quota with the geocoding caches, so an
 * unusually large one is used but not persisted.
 */
const MAX_CACHEABLE_BOUNDARY_POSITIONS = 20_000;

function countPositions(rings: number[][][]): number {
  return rings.reduce((total, ring) => total + ring.length, 0);
}

// Deduplicate concurrent requests for the same query/coordinates
const inFlightSearchRequests = new Map<string, Promise<SearchResult[]>>();
const inFlightReverseRequests = new Map<string, Promise<SearchResult>>();
const inFlightBoundaryRequests = new Map<
  string,
  Promise<LocationBoundary | null>
>();

function resolveOsmRef(location: Location | null | undefined): string {
  const prefix = OSM_TYPE_PREFIXES[String(location?.osmType ?? "").toLowerCase()];
  const osmId = Number(location?.osmId);
  if (!prefix || !Number.isInteger(osmId) || osmId <= 0) {
    return "";
  }
  return `${prefix}${osmId}`;
}

export function createNominatimAdapter(
  http: IHttp,
  cache: ICache,
): IGeocodePort {
  async function searchLocations(
    query: string,
    limit = 6,
    signal?: AbortSignal,
  ): Promise<SearchResult[]> {
    const lookup = String(query ?? "").trim();
    if (lookup.length < 2) {
      return [];
    }

    const normalizedLimit = Math.max(1, Math.min(Math.round(limit), 10));
    const cacheKey = getLocationSearchCacheKey(lookup, normalizedLimit);
    const cached = cache.read<SearchResult[]>(cacheKey, LOCATION_SEARCH_TTL_MS);
    if (Array.isArray(cached)) {
      return cached;
    }

    if (inFlightSearchRequests.has(cacheKey)) {
      return inFlightSearchRequests.get(cacheKey)!;
    }

    const url =
      "https://nominatim.openstreetmap.org/search?" +
      `format=jsonv2&addressdetails=1&limit=${normalizedLimit}&q=${encodeURIComponent(lookup)}`;

    const promise = http
      .get(url, { headers: { Accept: "application/json" }, signal }, 16_000)
      .then(async (response) => {
        const data = await response.json();
        const results = parseLocationResponseItems(data);
        cache.write(cacheKey, results);
        return results;
      })
      .finally(() => {
        inFlightSearchRequests.delete(cacheKey);
      });

    inFlightSearchRequests.set(cacheKey, promise);
    return promise;
  }

  async function geocodeLocation(query: string): Promise<SearchResult> {
    const lookup = String(query ?? "").trim();
    if (!lookup) {
      throw new Error("Location is required.");
    }

    const cacheKey = getGeocodeCacheKey(lookup);
    const cached = cache.read<Record<string, unknown>>(
      cacheKey,
      GEOCODE_TTL_MS,
    );
    if (cached && typeof cached === "object") {
      const normalizedCached = normalizeLocationResult(cached as any, lookup);
      if (normalizedCached) {
        return normalizedCached;
      }
    }

    const results = await searchLocations(lookup, 1);
    if (results.length === 0) {
      throw new Error(`No coordinates found for "${lookup}"`);
    }

    const first = results[0];
    cache.write(cacheKey, first);
    return first;
  }

  async function geocodeCity(
    city: string,
    country: string,
  ): Promise<{ lat: number; lon: number; displayName: string }> {
    const lookup = `${city}, ${country}`.trim();
    const location = await geocodeLocation(lookup);
    return {
      lat: location.lat,
      lon: location.lon,
      displayName: location.label,
    };
  }

  async function reverseGeocode(lat: number, lon: number): Promise<SearchResult> {
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      throw new Error("Latitude and longitude are required.");
    }

    const cacheKey = getReverseGeocodeCacheKey(lat, lon);
    const cached = cache.read<Record<string, unknown>>(cacheKey, GEOCODE_TTL_MS);
    if (cached && typeof cached === "object") {
      const normalizedCached = normalizeLocationResult(cached as any);
      if (normalizedCached) {
        return normalizedCached;
      }
    }

    if (inFlightReverseRequests.has(cacheKey)) {
      return inFlightReverseRequests.get(cacheKey)!;
    }

    const url =
      "https://nominatim.openstreetmap.org/reverse?" +
      `format=jsonv2&addressdetails=1&zoom=10&lat=${encodeURIComponent(String(lat))}&lon=${encodeURIComponent(String(lon))}`;

    const promise = http
      .get(url, { headers: { Accept: "application/json" } }, 16_000)
      .then(async (response) => {
        const data = await response.json();
        const normalized = normalizeLocationResult(data);
        if (!normalized) {
          throw new Error("No nearby city found for the selected coordinates.");
        }
        cache.write(cacheKey, normalized);
        return normalized;
      })
      .finally(() => {
        inFlightReverseRequests.delete(cacheKey);
      });

    inFlightReverseRequests.set(cacheKey, promise);
    return promise;
  }

  /**
   * Nominatim only returns geometry when `polygon_threshold` keeps it small —
   * an unsimplified country outline runs into megabytes — so the caller-provided
   * tolerance is always sent and is part of the cache key.
   */
  async function fetchLocationBoundary(
    location: Location,
    toleranceDeg: number,
  ): Promise<LocationBoundary | null> {
    const osmRef = resolveOsmRef(location);
    if (!osmRef) {
      return null;
    }

    if (!Number.isFinite(toleranceDeg) || toleranceDeg <= 0) {
      throw new Error("A positive simplification tolerance is required.");
    }

    const cacheKey = getBoundaryCacheKey(osmRef, toleranceDeg);
    const cached = cache.read<LocationBoundary>(cacheKey, GEOCODE_TTL_MS);
    if (cached && Array.isArray(cached.rings)) {
      return cached.rings.length > 0 ? cached : null;
    }

    if (inFlightBoundaryRequests.has(cacheKey)) {
      return inFlightBoundaryRequests.get(cacheKey)!;
    }

    const url =
      "https://nominatim.openstreetmap.org/lookup?" +
      `format=jsonv2&polygon_geojson=1&polygon_threshold=${toleranceDeg}` +
      `&osm_ids=${encodeURIComponent(osmRef)}`;

    const promise = http
      .get(url, { headers: { Accept: "application/json" } }, 20_000)
      .then(async (response) => {
        const data = await response.json();
        const entry = Array.isArray(data) ? data[0] : null;
        const rings = parseBoundaryRings(entry?.geojson);
        const boundary: LocationBoundary = { id: osmRef, rings };

        // Cached either way: a place without an outline stays without one.
        if (countPositions(rings) <= MAX_CACHEABLE_BOUNDARY_POSITIONS) {
          cache.write(cacheKey, boundary);
        }
        return rings.length > 0 ? boundary : null;
      })
      .finally(() => {
        inFlightBoundaryRequests.delete(cacheKey);
      });

    inFlightBoundaryRequests.set(cacheKey, promise);
    return promise;
  }

  return {
    searchLocations,
    geocodeLocation,
    reverseGeocode,
    geocodeCity,
    fetchLocationBoundary,
  };
}
