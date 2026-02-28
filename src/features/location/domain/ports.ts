import type { Location } from "./types";

export interface IGeocodePort {
  searchLocations(query: string, limit?: number): Promise<Location[]>;
  geocodeLocation(query: string): Promise<Location>;
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
