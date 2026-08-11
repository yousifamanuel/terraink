import type { Location, LocationBoundary } from "./types";

export interface IGeocodePort {
  searchLocations(query: string, limit?: number, signal?: AbortSignal): Promise<Location[]>;
  geocodeLocation(query: string): Promise<Location>;
  reverseGeocode(lat: number, lon: number): Promise<Location>;
  geocodeCity(
    city: string,
    country: string,
  ): Promise<{ lat: number; lon: number; displayName: string }>;
  /**
   * Resolves the administrative outline of a location.
   * Returns null when the place has no polygon (single nodes, POIs).
   */
  fetchLocationBoundary(
    location: Location,
    toleranceDeg: number,
  ): Promise<LocationBoundary | null>;
}

/** @internal Return type for geocodeCity. Ports allow alternative shapes. */
export type GeocodeCityResult = {
  lat: number;
  lon: number;
  displayName: string;
};
