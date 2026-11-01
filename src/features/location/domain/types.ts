export interface Location {
  id: string;
  label: string;
  city: string;
  country: string;
  countryCode?: string;
  continent?: string;
  lat: number;
  lon: number;
}

export interface SearchResult extends Location {}

export interface RecentLocation extends Location {
  lastUsedAt: number;
}
