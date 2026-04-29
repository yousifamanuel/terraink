import { haversineMeters } from "@/shared/geo/math";
import type { Coordinate } from "@/shared/geo/types";
import type { MarkerItem } from "@/features/markers/domain/types";
import {
  DEFAULT_ROUTE_COLOR,
  DEFAULT_ROUTE_ENDPOINT_SIZE,
  DEFAULT_ROUTE_FINISH_ICON_ID,
  DEFAULT_ROUTE_OPACITY,
  DEFAULT_ROUTE_START_ICON_ID,
  DEFAULT_ROUTE_STROKE_WIDTH,
} from "../domain/constants";
import type {
  ParsedGpx,
  Route,
  RouteBounds,
  RouteDefaults,
  RouteEndpointMarker,
  RouteSource,
} from "../domain/types";

const METERS_PER_DEGREE_LAT = 111_320;

function createId(prefix: string): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createDefaultRouteSettings(): RouteDefaults {
  return {
    color: DEFAULT_ROUTE_COLOR,
    strokeWidth: DEFAULT_ROUTE_STROKE_WIDTH,
    opacity: DEFAULT_ROUTE_OPACITY,
    lineStyle: "solid",
    startIconId: DEFAULT_ROUTE_START_ICON_ID,
    finishIconId: DEFAULT_ROUTE_FINISH_ICON_ID,
  };
}

export function getGpxUploadLabel(filename: string): string {
  const baseName = filename.replace(/\.[^.]+$/, "").trim();
  return baseName || "Route";
}

export function createRouteEndpointMarker(input: {
  iconId: string;
  defaults: RouteDefaults;
}): RouteEndpointMarker {
  return {
    iconId: input.iconId,
    color: input.defaults.color,
    size: DEFAULT_ROUTE_ENDPOINT_SIZE,
  };
}

export function createRoute(input: {
  parsed: ParsedGpx;
  defaults: RouteDefaults;
  source?: RouteSource;
  label?: string;
  sourceFilename?: string;
}): Route {
  const source = input.source ?? "gpx";
  return {
    id: createId(source),
    label: input.label ?? input.parsed.label,
    source,
    sourceFilename: input.sourceFilename,
    segments: input.parsed.segments,
    color: input.defaults.color,
    strokeWidth: input.defaults.strokeWidth,
    opacity: input.defaults.opacity,
    lineStyle: input.defaults.lineStyle,
    visible: true,
    showEndpoints: true,
    startMarker: createRouteEndpointMarker({
      iconId: input.defaults.startIconId,
      defaults: input.defaults,
    }),
    finishMarker: createRouteEndpointMarker({
      iconId: input.defaults.finishIconId,
      defaults: input.defaults,
    }),
  };
}

export function routeEndpointMarkerItems(routes: Route[]): MarkerItem[] {
  const items: MarkerItem[] = [];
  for (const route of routes) {
    if (!route.visible || !route.showEndpoints) continue;
    const endpoints = routeEndpoints(route);
    if (!endpoints) continue;
    items.push({
      id: `${route.id}-start`,
      lat: endpoints.start.lat,
      lon: endpoints.start.lon,
      iconId: route.startMarker.iconId,
      color: route.startMarker.color,
      size: route.startMarker.size,
    });
    items.push({
      id: `${route.id}-finish`,
      lat: endpoints.finish.lat,
      lon: endpoints.finish.lon,
      iconId: route.finishMarker.iconId,
      color: route.finishMarker.color,
      size: route.finishMarker.size,
    });
  }
  return items;
}

export function routeEndpoints(
  route: Route,
): { start: Coordinate; finish: Coordinate } | null {
  let start: Coordinate | null = null;
  let finish: Coordinate | null = null;
  for (const segment of route.segments) {
    if (segment.length === 0) continue;
    if (!start) start = segment[0]!;
    finish = segment[segment.length - 1]!;
  }
  return start && finish ? { start, finish } : null;
}

export function boundsCenter(bounds: RouteBounds): { lat: number; lon: number } {
  return {
    lat: (bounds.minLat + bounds.maxLat) / 2,
    lon: (bounds.minLon + bounds.maxLon) / 2,
  };
}

/**
 * Half-width distance (meters) that covers the bounding box with padding.
 * Form state drives MapLibre zoom via distance, so returning meters lets us
 * dispatch `SET_FORM_FIELDS` directly.
 */
export function boundsHalfWidthMeters(bounds: RouteBounds): number {
  const center = boundsCenter(bounds);
  const latSpan = bounds.maxLat - bounds.minLat;
  const lonSpan = bounds.maxLon - bounds.minLon;

  const latMeters = latSpan * METERS_PER_DEGREE_LAT;
  const lonMeters =
    lonSpan * METERS_PER_DEGREE_LAT * Math.cos((center.lat * Math.PI) / 180);

  const padding = 1.2;
  return (Math.max(latMeters, lonMeters) / 2) * padding;
}

export function unionBounds(a: RouteBounds, b: RouteBounds): RouteBounds {
  return {
    minLat: Math.min(a.minLat, b.minLat),
    maxLat: Math.max(a.maxLat, b.maxLat),
    minLon: Math.min(a.minLon, b.minLon),
    maxLon: Math.max(a.maxLon, b.maxLon),
  };
}

export function routeBounds(route: Route): RouteBounds | null {
  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLon = Infinity;
  let maxLon = -Infinity;
  let hasPoint = false;

  for (const segment of route.segments) {
    for (const { lat, lon } of segment) {
      hasPoint = true;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
      if (lon < minLon) minLon = lon;
      if (lon > maxLon) maxLon = lon;
    }
  }

  return hasPoint ? { minLat, maxLat, minLon, maxLon } : null;
}

export function combinedRoutesBounds(
  routes: Route[],
  extra?: RouteBounds,
): RouteBounds | null {
  let acc: RouteBounds | null = extra ? { ...extra } : null;
  for (const route of routes) {
    const bounds = routeBounds(route);
    if (!bounds) continue;
    acc = acc ? unionBounds(acc, bounds) : bounds;
  }
  return acc;
}

export function routeLengthMeters(route: Route): number {
  let total = 0;
  for (const segment of route.segments) {
    for (let i = 1; i < segment.length; i += 1) {
      total += haversineMeters(segment[i - 1]!, segment[i]!);
    }
  }
  return total;
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Could not read GPX file."));
    reader.readAsText(file);
  });
}
