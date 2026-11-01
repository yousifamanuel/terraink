import type { Location, RecentLocation } from "./types";

export interface IRecentLocationsStore {
  list(): RecentLocation[];
  add(location: Location): RecentLocation[];
  remove(id: string): RecentLocation[];
  clear(): void;
}

export interface IGeocodePort {
  searchLocations(query: string, limit?: number, signal?: AbortSignal): Promise<Location[]>;
  geocodeLocation(query: string): Promise<Location>;
  reverseGeocode(lat: number, lon: number): Promise<Location>;
  geocodeCity(
    city: string,
    country: string,
  ): Promise<{ lat: number; lon: number; displayName: string }>;
}

/** @internal Return type for geocodeCity. Ports allow alternative shapes. */
export type GeocodeCityResult = {
  lat: number;
  lon: number;
  displayName: string;
};
