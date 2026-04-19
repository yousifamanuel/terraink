import type { Coordinate } from "@/shared/geo/types";
import type { GPX_LINE_STYLES } from "./constants";

export type GpxLineStyle = (typeof GPX_LINE_STYLES)[number];

export interface GpxTrack {
  id: string;
  label: string;
  segments: Coordinate[][];
  color: string;
  strokeWidth: number;
  opacity: number;
  lineStyle: GpxLineStyle;
  visible: boolean;
}

export interface GpxDefaults {
  color: string;
  strokeWidth: number;
  opacity: number;
  lineStyle: GpxLineStyle;
}

export interface GpxBounds {
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
}

export interface ParsedGpx {
  label: string;
  segments: Coordinate[][];
  bounds: GpxBounds;
  pointCount: number;
}
