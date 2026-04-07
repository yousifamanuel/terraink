import type { ResolvedTheme } from "@/features/theme/domain/types";
import type {
  MarkerIconDefinition,
  MarkerItem,
  MarkerProjectionInput,
} from "@/features/markers/domain/types";

export interface CanvasSize {
  width: number;
  height: number;
  requestedWidth: number;
  requestedHeight: number;
  downscaleFactor: number;
}

/** Options passed to the export compositor (map snapshot + text overlay). */
export interface ExportOptions {
  theme: ResolvedTheme;
  center: { lat: number; lon: number };
  widthInches: number;
  heightInches: number;
  displayCity: string;
  displayCountry: string;
  displayContinent?: string;
  fontFamily: string;
  textAlign?: 'left' | 'center' | 'right';
  textVerticalAlign?: 'top' | 'middle' | 'bottom';
  cityFontScale?: number;
  countryFontScale?: number;
  coordsFontScale?: number;
  showPosterText: boolean;
  showOverlay?: boolean;
  includeCredits?: boolean;
  markers?: MarkerItem[];
  markerIcons?: MarkerIconDefinition[];
  markerProjection?: MarkerProjectionInput;
  markerScaleX?: number;
  markerScaleY?: number;
  markerSizeScale?: number;
}

export interface Typography {
  displayCity: string;
  displayCountry: string;
  displayContinent?: string;
  fontFamily: string;
  showPosterText: boolean;
  includeCredits?: boolean;
}
