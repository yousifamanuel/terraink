import type { Map as MaplibreMap } from "maplibre-gl";
import type { MarkerProjectionInput } from "@/features/markers/domain/types";
import { projectMarkerToCanvas } from "@/features/markers/infrastructure/projection";
import { resolveColor, resolveNumber, resolveStyleValue } from "./styleExpression";

/** One decimal is well below a printed dot at 300 DPI and roughly halves file size. */
const COORDINATE_PRECISION = 1;

/** Geometry this far outside the poster cannot contribute, not even via stroke width. */
const CULL_MARGIN_PX = 64;

const DEFAULT_LINE_WIDTH = 1;
const DEFAULT_COLOR = "#000000";

type Projector = (lon: number, lat: number) => { x: number; y: number };

interface CullRect {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export interface VectorMapSvgOptions {
  map: MaplibreMap;
  exportWidth: number;
  exportHeight: number;
  /** Projection input sized to the render canvas, as used for markers. */
  projection: MarkerProjectionInput;
  /** Render canvas to export canvas scale, applied to positions and widths. */
  scaleX: number;
  scaleY: number;
}

export interface VectorMapLayer {
  id: string;
  markup: string;
}

function escapeAttribute(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

function formatCoordinate(value: number): string {
  return value.toFixed(COORDINATE_PRECISION);
}

function buildSubpath(
  positions: unknown,
  project: Projector,
  close: boolean,
  cull: CullRect,
): string {
  if (!Array.isArray(positions) || positions.length < 2) {
    return "";
  }

  const points: [number, number][] = [];
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const position of positions) {
    if (!Array.isArray(position) || position.length < 2) continue;
    const lon = Number(position[0]);
    const lat = Number(position[1]);
    if (!Number.isFinite(lon) || !Number.isFinite(lat)) continue;

    const { x, y } = project(lon, lat);
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue;

    points.push([x, y]);
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }

  if (points.length < 2) {
    return "";
  }

  if (
    maxX < cull.minX ||
    minX > cull.maxX ||
    maxY < cull.minY ||
    minY > cull.maxY
  ) {
    return "";
  }

  let data = `M${formatCoordinate(points[0][0])} ${formatCoordinate(points[0][1])}`;
  for (let index = 1; index < points.length; index += 1) {
    data += `L${formatCoordinate(points[index][0])} ${formatCoordinate(points[index][1])}`;
  }

  return close ? `${data}Z` : data;
}

function geometryToPathData(
  geometry: GeoJSON.Geometry | null | undefined,
  project: Projector,
  cull: CullRect,
): string {
  if (!geometry) return "";

  switch (geometry.type) {
    case "LineString":
      return buildSubpath(geometry.coordinates, project, false, cull);
    case "MultiLineString":
      return geometry.coordinates
        .map((line) => buildSubpath(line, project, false, cull))
        .join("");
    case "Polygon":
      return geometry.coordinates
        .map((ring) => buildSubpath(ring, project, true, cull))
        .join("");
    case "MultiPolygon":
      return geometry.coordinates
        .flat()
        .map((ring) => buildSubpath(ring, project, true, cull))
        .join("");
    default:
      return "";
  }
}

function isLayerVisibleAtZoom(layer: any, zoom: number): boolean {
  if ((layer.layout?.visibility ?? "visible") === "none") return false;
  if (typeof layer.minzoom === "number" && zoom < layer.minzoom) return false;
  if (typeof layer.maxzoom === "number" && zoom >= layer.maxzoom) return false;
  return true;
}

function renderBackground(
  layer: any,
  zoom: number,
  width: number,
  height: number,
): string {
  const color = resolveColor(layer.paint?.["background-color"], zoom, DEFAULT_COLOR);
  const opacity = resolveNumber(layer.paint?.["background-opacity"], zoom, 1);
  if (opacity <= 0) return "";

  return (
    `<rect width="${width}" height="${height}" fill="${escapeAttribute(color)}"` +
    `${opacity < 1 ? ` opacity="${opacity}"` : ""} />`
  );
}

function renderLinePaths(
  layer: any,
  features: GeoJSON.Feature[],
  zoom: number,
  project: Projector,
  cull: CullRect,
  widthScale: number,
): string {
  const strokeWidth =
    resolveNumber(layer.paint?.["line-width"], zoom, DEFAULT_LINE_WIDTH) * widthScale;
  if (strokeWidth <= 0) return "";

  const stroke = resolveColor(layer.paint?.["line-color"], zoom, DEFAULT_COLOR);
  const lineCap = layer.layout?.["line-cap"] ?? "butt";
  const lineJoin = layer.layout?.["line-join"] ?? "miter";

  const dashPattern = resolveStyleValue(layer.paint?.["line-dasharray"], zoom);
  // MapLibre expresses dashes in line-width units, SVG in user units.
  const dashArray = Array.isArray(dashPattern)
    ? dashPattern.map((entry) => (entry * strokeWidth).toFixed(2)).join(" ")
    : "";

  const paths: string[] = [];
  for (const feature of features) {
    const data = geometryToPathData(feature.geometry, project, cull);
    if (data) paths.push(`<path d="${data}" />`);
  }
  if (paths.length === 0) return "";

  return (
    `<g fill="none" stroke="${escapeAttribute(stroke)}" stroke-width="${strokeWidth.toFixed(2)}"` +
    ` stroke-linecap="${escapeAttribute(String(lineCap))}"` +
    ` stroke-linejoin="${escapeAttribute(String(lineJoin))}"` +
    `${dashArray ? ` stroke-dasharray="${dashArray}"` : ""}>` +
    `${paths.join("")}</g>`
  );
}

function renderFillPaths(
  layer: any,
  features: GeoJSON.Feature[],
  zoom: number,
  project: Projector,
  cull: CullRect,
): string {
  const fill = resolveColor(layer.paint?.["fill-color"], zoom, DEFAULT_COLOR);

  const paths: string[] = [];
  for (const feature of features) {
    const data = geometryToPathData(feature.geometry, project, cull);
    if (data) paths.push(`<path d="${data}" />`);
  }
  if (paths.length === 0) return "";

  // evenodd keeps polygon holes correct without relying on ring winding order,
  // which vector tiles do not guarantee.
  return (
    `<g fill="${escapeAttribute(fill)}" fill-rule="evenodd" stroke="none">` +
    `${paths.join("")}</g>`
  );
}

/**
 * Redraws the map layers of `map` as SVG geometry instead of a rasterised
 * snapshot, so the exported poster stays editable and resolution independent.
 *
 * Returns null when the style yields no drawable geometry, which lets the
 * caller keep the raster output rather than emit an empty poster.
 *
 * Known trade-offs:
 * - Features are read through `querySourceFeatures`, so geometry that spans a
 *   tile boundary is returned once per tile. Layer opacity is therefore applied
 *   to the group rather than to each path: the group composites as a unit, so
 *   the overlap cannot darken seams.
 * - Only tiles currently loaded for the export view contribute, which is
 *   exactly the poster's own extent.
 */
export function renderMapLayersAsSvg({
  map,
  exportWidth,
  exportHeight,
  projection,
  scaleX,
  scaleY,
}: VectorMapSvgOptions): VectorMapLayer[] | null {
  const style = map.getStyle();
  const layers = style?.layers ?? [];
  const zoom = projection.zoom;

  const project: Projector = (lon, lat) => {
    const point = projectMarkerToCanvas(lat, lon, projection);
    return { x: point.x * scaleX, y: point.y * scaleY };
  };

  const cull: CullRect = {
    minX: -CULL_MARGIN_PX,
    minY: -CULL_MARGIN_PX,
    maxX: exportWidth + CULL_MARGIN_PX,
    maxY: exportHeight + CULL_MARGIN_PX,
  };

  const rendered: VectorMapLayer[] = [];
  let featureCount = 0;

  for (const layer of layers as any[]) {
    if (!isLayerVisibleAtZoom(layer, zoom)) continue;

    if (layer.type === "background") {
      const markup = renderBackground(layer, zoom, exportWidth, exportHeight);
      if (markup) rendered.push({ id: layer.id, markup });
      continue;
    }

    if (layer.type !== "line" && layer.type !== "fill") continue;
    if (!layer.source) continue;

    const opacityKey = layer.type === "line" ? "line-opacity" : "fill-opacity";
    const opacity = resolveNumber(layer.paint?.[opacityKey], zoom, 1);
    // Zero opacity is how the style disables sub-layers such as road casings.
    if (opacity <= 0) continue;

    let features: GeoJSON.Feature[];
    try {
      features = map.querySourceFeatures(layer.source, {
        sourceLayer: layer["source-layer"],
        filter: layer.filter,
      }) as unknown as GeoJSON.Feature[];
    } catch {
      // A source that cannot be queried simply contributes nothing.
      continue;
    }

    if (features.length === 0) continue;
    featureCount += features.length;

    const body =
      layer.type === "line"
        ? renderLinePaths(layer, features, zoom, project, cull, scaleX)
        : renderFillPaths(layer, features, zoom, project, cull);

    if (body) {
      rendered.push({
        id: layer.id,
        markup: opacity < 1 ? `<g opacity="${opacity.toFixed(3)}">${body}</g>` : body,
      });
    }
  }

  return featureCount > 0 ? rendered : null;
}
