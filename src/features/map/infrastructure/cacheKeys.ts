import type { Bounds } from "@/shared/geo/types";

export function boundsToCacheKey(bounds: Bounds): string {
  return `${bounds.south.toFixed(5)}:${bounds.west.toFixed(5)}:${bounds.north.toFixed(5)}:${bounds.east.toFixed(5)}`;
}

export function getLocationSearchCacheKey(
  lookup: string,
  limit: number,
): string {
  return `location-search:${lookup.toLowerCase()}:limit:${limit}`;
}

export function getGeocodeCacheKey(lookup: string): string {
  return `geocode:location:${lookup.toLowerCase()}`;
}

export function getMapCacheKey(bounds: Bounds, buildingBounds: Bounds): string {
  return `map:${boundsToCacheKey(bounds)}:buildings:${boundsToCacheKey(buildingBounds)}`;
}
