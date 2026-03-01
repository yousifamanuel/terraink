import type { RefObject } from "react";
import type { Map as MaplibreMap } from "maplibre-gl";

/** Centre + zoom state synchronised between the map and the form. */
export interface MapViewState {
  center: [lon: number, lat: number];
  zoom: number;
}

/** Writable map instance ref without relying on deprecated MutableRefObject. */
export type MapInstanceRef = RefObject<MaplibreMap | null> & {
  current: MaplibreMap | null;
};
