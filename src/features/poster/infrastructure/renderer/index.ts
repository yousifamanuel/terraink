import { applyFades } from "./layers";
import { drawPosterText } from "./typography";
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
export function compositeExport(
  mapCanvas: HTMLCanvasElement,
  options: ExportOptions,
): { canvas: HTMLCanvasElement; size: CanvasSize } {
  const {
    theme,
    center,
    widthInches: _wi,
    heightInches: _hi,
    displayCity,
    displayCountry,
    fontFamily,
    showPosterText = true,
    includeCredits = true,
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
  applyFades(ctx, width, height, theme.gradient_color || theme.bg);

  // 3. Poster text
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
    includeCredits,
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
export { drawPosterText, isLatinScript } from "./typography";
