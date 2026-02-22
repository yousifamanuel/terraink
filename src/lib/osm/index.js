import { readCache, writeCache } from "../cache";
import {
  GEOCODE_TTL_MS,
  LOCATION_SEARCH_TTL_MS,
  MAP_TTL_MS,
  OVERPASS_ENDPOINTS,
} from "./constants";
import {
  getGeocodeCacheKey,
  getLocationSearchCacheKey,
  getMapCacheKey,
} from "./cacheKeys";
import { fetchWithTimeout } from "./http";
import { normalizeMapData } from "./helpers";
import { parseLocationResponseItems, normalizeLocationResult } from "./locationParser";
import { parseOverpassPayload } from "./overpassParser";
import { buildOverpassQuery } from "./overpassQuery";

export async function searchLocations(query, limit = 6) {
  const lookup = String(query ?? "").trim();
  if (lookup.length < 2) {
    return [];
  }

  const normalizedLimit = Math.max(1, Math.min(Math.round(limit), 10));
  const cacheKey = getLocationSearchCacheKey(lookup, normalizedLimit);
  const cached = readCache(cacheKey, LOCATION_SEARCH_TTL_MS);
  if (Array.isArray(cached)) {
    return cached;
  }

  const url =
    "https://nominatim.openstreetmap.org/search?" +
    `format=jsonv2&addressdetails=1&limit=${normalizedLimit}&q=${encodeURIComponent(
      lookup,
    )}`;

  const response = await fetchWithTimeout(
    url,
    {
      headers: {
        Accept: "application/json",
      },
    },
    16_000,
  );

  if (!response.ok) {
    throw new Error(`Location search failed with HTTP ${response.status}`);
  }

  const payload = await response.json();
  const results = parseLocationResponseItems(payload);
  writeCache(cacheKey, results);
  return results;
}

export async function geocodeLocation(query) {
  const lookup = String(query ?? "").trim();
  if (!lookup) {
    throw new Error("Location is required.");
  }

  const cacheKey = getGeocodeCacheKey(lookup);
  const cached = readCache(cacheKey, GEOCODE_TTL_MS);
  if (cached && typeof cached === "object") {
    const normalizedCached = normalizeLocationResult(cached, lookup);
    if (normalizedCached) {
      return normalizedCached;
    }
  }

  const results = await searchLocations(lookup, 1);
  if (results.length === 0) {
    throw new Error(`No coordinates found for "${lookup}"`);
  }

  const first = results[0];
  writeCache(cacheKey, first);
  return first;
}

export async function geocodeCity(city, country) {
  const lookup = `${city}, ${country}`.trim();
  const location = await geocodeLocation(lookup);
  return {
    lat: location.lat,
    lon: location.lon,
    displayName: location.label,
  };
}

export async function fetchMapData(bounds, options = {}) {
  const buildingBounds = options.buildingBounds ?? bounds;
  const cacheKey = getMapCacheKey(bounds, buildingBounds);
  const cached = readCache(cacheKey, MAP_TTL_MS);
  if (cached) {
    return normalizeMapData(cached);
  }

  const query = buildOverpassQuery(bounds, buildingBounds);
  let lastError = null;

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const response = await fetchWithTimeout(
        endpoint,
        {
          method: "POST",
          headers: {
            "Content-Type": "text/plain;charset=UTF-8",
            Accept: "application/json",
          },
          body: query,
        },
        25_000,
      );

      if (!response.ok) {
        throw new Error(`Overpass HTTP ${response.status}`);
      }

      const payload = await response.json();
      const parsed = parseOverpassPayload(payload);
      writeCache(cacheKey, parsed);
      return normalizeMapData(parsed);
    } catch (error) {
      lastError = error;
    }
  }

  const message =
    lastError instanceof Error ? lastError.message : "Failed to fetch map data";
  throw new Error(message);
}

export {
  GEOCODE_TTL_MS,
  LOCATION_SEARCH_TTL_MS,
  MAP_TTL_MS,
  OVERPASS_ENDPOINTS,
} from "./constants";
export { buildOverpassQuery } from "./overpassQuery";
export { normalizeLocationResult, parseLocationResponseItems } from "./locationParser";
export { parseOverpassPayload } from "./overpassParser";
export { normalizeMapData } from "./helpers";
