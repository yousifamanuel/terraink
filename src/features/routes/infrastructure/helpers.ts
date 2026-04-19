import {
  DEFAULT_GPX_COLOR,
  DEFAULT_GPX_OPACITY,
  DEFAULT_GPX_STROKE_WIDTH,
} from "../domain/constants";
import type {
  GpxBounds,
  GpxDefaults,
  GpxTrack,
  ParsedGpx,
} from "../domain/types";

const METERS_PER_DEGREE_LAT = 111_320;

function createId(prefix: string): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createDefaultGpxSettings(): GpxDefaults {
  return {
    color: DEFAULT_GPX_COLOR,
    strokeWidth: DEFAULT_GPX_STROKE_WIDTH,
    opacity: DEFAULT_GPX_OPACITY,
    lineStyle: "solid",
  };
}

export function getGpxUploadLabel(filename: string): string {
  const baseName = filename.replace(/\.[^.]+$/, "").trim();
  return baseName || "Track";
}

export function createGpxTrack(input: {
  parsed: ParsedGpx;
  defaults: GpxDefaults;
  label?: string;
}): GpxTrack {
  return {
    id: createId("gpx"),
    label: input.label ?? input.parsed.label,
    segments: input.parsed.segments,
    color: input.defaults.color,
    strokeWidth: input.defaults.strokeWidth,
    opacity: input.defaults.opacity,
    lineStyle: input.defaults.lineStyle,
    visible: true,
  };
}

export function boundsCenter(bounds: GpxBounds): { lat: number; lon: number } {
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
export function boundsHalfWidthMeters(bounds: GpxBounds): number {
  const center = boundsCenter(bounds);
  const latSpan = bounds.maxLat - bounds.minLat;
  const lonSpan = bounds.maxLon - bounds.minLon;

  const latMeters = latSpan * METERS_PER_DEGREE_LAT;
  const lonMeters =
    lonSpan * METERS_PER_DEGREE_LAT * Math.cos((center.lat * Math.PI) / 180);

  const padding = 1.2;
  return (Math.max(latMeters, lonMeters) / 2) * padding;
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Could not read GPX file."));
    reader.readAsText(file);
  });
}
