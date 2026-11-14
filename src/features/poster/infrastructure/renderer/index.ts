import i18n from "@/core/i18n";
import { applyFades, drawTemplateFrame } from "./layers";
import { drawPosterText } from "./typography";
import { drawMarkersOnCanvas } from "@/features/markers/infrastructure/rendering";
import { drawRoutesOnCanvas } from "@/features/routes/infrastructure/rendering";
import { routeEndpointMarkerItems } from "@/features/routes/infrastructure/helpers";
import type { ExportOptions, CanvasSize } from "../../domain/types";
import { buildPosterLayout } from "@/features/poster/domain/posterStyleTemplates";

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
    showPosterText = true,
    coordinateText,
    showOverlay = true,
    posterLayout,
    includeCredits = true,
    markers = [],
    markerIcons = [],
    markerProjection,
    markerScaleX = 1,
    markerScaleY = 1,
    markerSizeScale = 1,
    routes = [],
  } = options;

  const width = mapCanvas.width;
  const height = mapCanvas.height;
  const template = buildPosterLayout(posterLayout);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error(i18n.t("export.errors.canvasUnavailable"));

  // 1. Draw map snapshot
  ctx.drawImage(mapCanvas, 0, 0);

  // 2. Gradient fades
  if (showOverlay) {
    applyFades(ctx, width, height, theme.ui.bg, template);
  }

  // 3. Routes (below markers)
  if (routes.length > 0 && markerProjection) {
    drawRoutesOnCanvas(
      ctx,
      routes,
      markerProjection,
      markerScaleX,
      markerScaleY,
      markerSizeScale,
    );
  }

  // 4. Route endpoint markers (between route lines and user markers)
  if (routes.length > 0 && markerIcons.length > 0 && markerProjection) {
    const endpointItems = routeEndpointMarkerItems(routes);
    if (endpointItems.length > 0) {
      await drawMarkersOnCanvas(
        ctx,
        endpointItems,
        markerIcons,
        markerProjection,
        markerScaleX,
        markerScaleY,
        markerSizeScale,
      );
    }
  }

  // 5. User markers
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

  // 6. Template frame
  drawTemplateFrame(ctx, width, height, theme.ui.text, template);

  // 7. Poster text
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
    template,
    coordinateText,
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
