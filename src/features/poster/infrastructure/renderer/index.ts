import { applyFades } from "./layers";
import { drawPosterText } from "./typography";
import { drawMarkersOnCanvas } from "@/features/markers/infrastructure/rendering";
import type { ExportOptions, CanvasSize } from "../../domain/types";

/**
 * Composites a final poster from a MapLibre snapshot canvas.
 *
 * 1. Draws the captured map image.
 * 2. Applies gradient fades (top + bottom).
 * 3. Draws poster text (city, country, coords, attribution).
 *
 * Returns the composited canvas + its size metadata.
 */
export async function compositeExport(
  mapCanvas: HTMLCanvasElement,
  options: ExportOptions,
): Promise<{ canvas: HTMLCanvasElement; size: CanvasSize }> {
  const {
    theme,
    center,
    widthInches: _wi,
    heightInches: _hi,
    displayCity,
    displayCountry,
    fontFamily,
    textAlign = 'center',
    cityFontScale = 1,
    countryFontScale = 1,
    coordsFontScale = 1,
    showPosterText = true,
    showOverlay = true,
    includeCredits = true,
    markers = [],
    markerIcons = [],
    markerProjection,
    markerScaleX = 1,
    markerScaleY = 1,
    markerSizeScale = 1,
  } = options;

  const width = mapCanvas.width;
  const height = mapCanvas.height;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas rendering is not available.");

  // 1. Draw map snapshot
  ctx.drawImage(mapCanvas, 0, 0);

  // 2. Gradient fades
  if (showOverlay) {
    applyFades(ctx, width, height, theme.ui.bg);
  }

  // 3. Markers
  if (markers.length > 0 && markerIcons.length > 0 && markerProjection) {
    await drawMarkersOnCanvas(
      ctx,
      markers,
      markerIcons,
      markerProjection,
      markerScaleX,
      markerScaleY,
      markerSizeScale,
    );
  }

  // 4. Poster text
  drawPosterText(
    ctx,
    width,
    height,
    theme,
    center,
    displayCity,
    displayCountry,
    fontFamily,
    showPosterText,
    showOverlay,
    includeCredits,
    textAlign,
    cityFontScale,
    countryFontScale,
    coordsFontScale,
  );

  const size: CanvasSize = {
    width,
    height,
    requestedWidth: width,
    requestedHeight: height,
    downscaleFactor: 1,
  };

  return { canvas, size };
}

export { resolveCanvasSize } from "./canvas";
export { applyFades } from "./layers";
export { drawPosterText } from "./typography";
