import type { ResolvedTheme } from "@/features/theme/domain/types";

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
  fontFamily: string;
  showPosterText: boolean;
  includeCredits?: boolean;
}

export interface Typography {
  displayCity: string;
  displayCountry: string;
  fontFamily: string;
  showPosterText: boolean;
  includeCredits?: boolean;
}
