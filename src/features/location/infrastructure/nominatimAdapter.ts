import type { ICache } from "@/core/cache/ports";
import type { IHttp } from "@/core/http/ports";
import type { IGeocodePort } from "../domain/ports";
import type { Location, SearchResult } from "../domain/types";
import {
  normalizeLocationResult,
  parseLocationResponseItems,
} from "./locationParser";
import {
  GEOCODE_TTL_MS,
  LOCATION_SEARCH_TTL_MS,
} from "@/features/map/infrastructure/constants";
import {
  getGeocodeCacheKey,
  getLocationSearchCacheKey,
  getReverseGeocodeCacheKey,
} from "@/features/map/infrastructure/cacheKeys";

// Deduplicate concurrent reverse geocode requests for the same coordinates
const inFlightReverseRequests = new Map<string, Promise<SearchResult>>();

export function createNominatimAdapter(
  http: IHttp,
  cache: ICache,
): IGeocodePort {
  async function searchLocations(
    query: string,
    limit = 6,
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

    const url =
      "https://nominatim.openstreetmap.org/search?" +
      `format=jsonv2&addressdetails=1&limit=${normalizedLimit}&q=${encodeURIComponent(lookup)}`;

    const response = await http.get(
      url,
      {
        headers: { Accept: "application/json" },
      },
      16_000,
    );

    const data = await response.json();
    const results = parseLocationResponseItems(data);
    cache.write(cacheKey, results);
    return results;
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

  return { searchLocations, geocodeLocation, reverseGeocode, geocodeCity };
}
