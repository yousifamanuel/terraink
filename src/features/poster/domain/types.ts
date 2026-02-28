import type { Bounds } from "@/shared/geo/types";
import type { MapData } from "@/features/map/domain/types";
import type { ResolvedTheme } from "@/features/theme/domain/types";

export interface CanvasSize {
  width: number;
  height: number;
  requestedWidth: number;
  requestedHeight: number;
  downscaleFactor: number;
}

export interface RenderOptions {
  theme: ResolvedTheme;
  mapData: MapData;
  bounds: Bounds;
  center: { lat: number; lon: number; displayName: string };
  widthInches: number;
  heightInches: number;
  displayCity: string;
  displayCountry: string;
  fontFamily: string;
  showPosterText: boolean;
  includeCredits?: boolean;
}

export interface RenderCache {
  mapData: MapData;
  bounds: Bounds;
  center: { lat: number; lon: number; displayName: string };
  widthInches: number;
  heightInches: number;
  baseCity: string;
  baseCountry: string;
  baseLocation: string;
}

export interface RenderResult {
  size: CanvasSize;
  center: { lat: number; lon: number; displayName: string };
  roads: number;
  water: number;
  parks: number;
  buildings: number;
  widthCm: number;
  heightCm: number;
  distanceMeters: number;
}

export interface GenerationState {
  status: string;
  error: string;
  isGenerating: boolean;
  progress: number;
  result: RenderResult | null;
}

export interface Typography {
  displayCity: string;
  displayCountry: string;
  fontFamily: string;
  showPosterText: boolean;
  includeCredits?: boolean;
}
