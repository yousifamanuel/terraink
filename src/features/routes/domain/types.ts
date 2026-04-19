import type { Coordinate } from "@/shared/geo/types";
import type { ROUTE_LINE_STYLES } from "./constants";

export type RouteLineStyle = (typeof ROUTE_LINE_STYLES)[number];

export type RouteSource = "gpx" | "manual";

export interface RouteEndpointMarker {
  iconId: string;
  color: string;
  size: number;
}

export interface Route {
  id: string;
  label: string;
  source: RouteSource;
  sourceFilename?: string;
  segments: Coordinate[][];
  color: string;
  strokeWidth: number;
  opacity: number;
  lineStyle: RouteLineStyle;
  visible: boolean;
  showEndpoints: boolean;
  startMarker: RouteEndpointMarker;
  finishMarker: RouteEndpointMarker;
}

export interface RouteDefaults {
  color: string;
  strokeWidth: number;
  opacity: number;
  lineStyle: RouteLineStyle;
  startIconId: string;
  finishIconId: string;
}

export interface RouteBounds {
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
}

export interface ParsedGpx {
  label: string;
  segments: Coordinate[][];
  bounds: RouteBounds;
  pointCount: number;
}
