export interface Location {
  id: string;
  label: string;
  city: string;
  country: string;
  lat: number;
  lon: number;
}

export interface SearchResult extends Location {}
