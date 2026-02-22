import { resolveCanvasSize } from "./canvas";
import { applyFades, drawBuildingLayer, drawPolygonLayer, drawRoadLayer } from "./layers";
import { createProjector } from "./projection";
import { drawPosterText } from "./typography";

export function renderPoster(canvas, options) {
  const {
    theme,
    mapData,
    bounds,
    center,
    widthInches,
    heightInches,
    displayCity,
    displayCountry,
    fontFamily,
  } = options;

  const size = resolveCanvasSize(widthInches, heightInches);
  canvas.width = size.width;
  canvas.height = size.height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas rendering is not available.");
  }

  ctx.fillStyle = theme.bg;
  ctx.fillRect(0, 0, size.width, size.height);

  const projector = createProjector(bounds, size.width, size.height);

  drawPolygonLayer(ctx, mapData.waterPolygons, projector, theme.water, bounds);
  drawPolygonLayer(ctx, mapData.parkPolygons, projector, theme.parks, bounds);
  drawBuildingLayer(
    ctx,
    mapData.buildingPolygons,
    projector,
    theme,
    bounds,
    Math.max(0.7, Math.min(size.width, size.height) / 3600),
  );

  const roadWidthScale = Math.max(0.7, Math.min(size.width, size.height) / 3600);
  drawRoadLayer(ctx, mapData.roads, projector, theme, roadWidthScale, bounds);

  applyFades(ctx, size.width, size.height, theme.gradient_color);
  drawPosterText(
    ctx,
    size.width,
    size.height,
    theme,
    center,
    displayCity,
    displayCountry,
    fontFamily,
  );

  return size;
}

export { resolveCanvasSize } from "./canvas";
export {
  applyFades,
  drawBuildingLayer,
  drawPolygonLayer,
  drawRoadLayer,
} from "./layers";
export { createProjector, polygonArea, pointsIntersectBounds } from "./projection";
export { parseHex, blendHex, withAlpha } from "./colors";
export { roadStyle, normalizeRoadType } from "./road";
export { drawPosterText, isLatinScript } from "./typography";
