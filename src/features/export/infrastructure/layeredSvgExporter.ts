import maplibregl from "maplibre-gl";
import type { Map as MaplibreMap } from "maplibre-gl";
import type {
  MarkerIconDefinition,
  MarkerItem,
} from "@/features/markers/domain/types";
import { drawMarkersOnCanvas } from "@/features/markers/infrastructure/rendering";
import type { Route } from "@/features/routes/domain/types";
import { drawRoutesOnCanvas } from "@/features/routes/infrastructure/rendering";
import { routeEndpointMarkerItems } from "@/features/routes/infrastructure/helpers";
import { applyFades } from "@/features/poster/infrastructure/renderer/layers";
import { drawPosterText } from "@/features/poster/infrastructure/renderer/typography";
import type { ResolvedTheme } from "@/features/theme/domain/types";
import {
  waitForMapIdle,
  createOffscreenContainer,
  resolveExportRenderParams,
} from "./exportUtils";
import { renderMapLayersAsSvg, type VectorMapLayer } from "./vectorMapSvg";

interface LayeredSvgOptions {
  map: MaplibreMap;
  exportWidth: number;
  exportHeight: number;
  theme: ResolvedTheme;
  center: { lat: number; lon: number };
  displayCity: string;
  displayCountry: string;
  fontFamily?: string;
  showPosterText: boolean;
  showOverlay: boolean;
  includeCredits: boolean;
  markers: MarkerItem[];
  markerIcons: MarkerIconDefinition[];
  routes?: Route[];
}

function renderMapCanvasToDataUrl(
  mapCanvas: HTMLCanvasElement,
  exportWidth: number,
  exportHeight: number,
): string {
  const layerCanvas = document.createElement("canvas");
  layerCanvas.width = exportWidth;
  layerCanvas.height = exportHeight;
  const ctx = layerCanvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not create 2D context for SVG layer export.");
  }
  ctx.clearRect(0, 0, exportWidth, exportHeight);
  ctx.drawImage(mapCanvas, 0, 0, exportWidth, exportHeight);
  return layerCanvas.toDataURL("image/png");
}

function canvasToDataUrl(
  width: number,
  height: number,
  draw: (ctx: CanvasRenderingContext2D) => void,
): string {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not create 2D context for SVG overlay export.");
  }
  ctx.clearRect(0, 0, width, height);
  draw(ctx);
  return canvas.toDataURL("image/png");
}

function sanitizeLayerId(id: string): string {
  return id.replace(/[^a-zA-Z0-9_-]/g, "-");
}

/**
 * Raster fallback: shows one style layer at a time and snapshots the canvas,
 * preserving the layered structure when vector geometry is unavailable.
 */
async function captureMapLayersAsDataUrls(
  exportMap: MaplibreMap,
  exportWidth: number,
  exportHeight: number,
): Promise<{ id: string; dataUrl: string }[]> {
  const layerIds = (exportMap.getStyle().layers ?? []).map((layer) => layer.id);
  const originalVisibility = new Map<string, string>();
  const visibleLayerIds = layerIds.filter((layerId) => {
    const visibility = String(
      exportMap.getLayoutProperty(layerId, "visibility") ?? "visible",
    );
    originalVisibility.set(layerId, visibility);
    return visibility !== "none";
  });

  for (const layerId of visibleLayerIds) {
    exportMap.setLayoutProperty(layerId, "visibility", "none");
  }
  await waitForMapIdle(exportMap);

  const captured: { id: string; dataUrl: string }[] = [];
  for (const layerId of visibleLayerIds) {
    exportMap.setLayoutProperty(layerId, "visibility", "visible");
    await waitForMapIdle(exportMap);
    captured.push({
      id: layerId,
      dataUrl: renderMapCanvasToDataUrl(
        exportMap.getCanvas(),
        exportWidth,
        exportHeight,
      ),
    });
    exportMap.setLayoutProperty(layerId, "visibility", "none");
    await waitForMapIdle(exportMap);
  }

  for (const layerId of layerIds) {
    exportMap.setLayoutProperty(
      layerId,
      "visibility",
      originalVisibility.get(layerId) ?? "visible",
    );
  }
  await waitForMapIdle(exportMap);

  return captured;
}

function toSvgGroups(prefix: string, layers: VectorMapLayer[]): string {
  return layers
    .map(
      (layer) => `<g id="${prefix}-${sanitizeLayerId(layer.id)}">
  ${layer.markup}
</g>`,
    )
    .join("\n");
}

export async function createLayeredSvgBlobFromMap({
  map,
  exportWidth,
  exportHeight,
  theme,
  center,
  displayCity,
  displayCountry,
  fontFamily,
  showPosterText,
  showOverlay,
  includeCredits,
  markers,
  markerIcons,
  routes = [],
}: LayeredSvgOptions): Promise<Blob> {
  await waitForMapIdle(map);

  const {
    center: mapCenter,
    zoom,
    pitch,
    bearing,
    style,
    renderWidth,
    renderHeight,
    pixelRatio,
    markerProjection,
    markerScaleX,
    markerScaleY,
    markerSizeScale,
  } = resolveExportRenderParams(map, exportWidth, exportHeight);

  const offscreenContainer = createOffscreenContainer(renderWidth, renderHeight);
  document.body.appendChild(offscreenContainer);

  const exportMap = new maplibregl.Map({
    container: offscreenContainer,
    style,
    center: [mapCenter.lng, mapCenter.lat],
    zoom,
    pitch,
    bearing,
    interactive: false,
    attributionControl: false,
    pixelRatio,
    canvasContextAttributes: { preserveDrawingBuffer: true },
  });

  try {
    await waitForMapIdle(exportMap);

    const vectorMapLayers = renderMapLayersAsSvg({
      map: exportMap,
      exportWidth,
      exportHeight,
      projection: markerProjection,
      scaleX: markerScaleX,
      scaleY: markerScaleY,
    });

    // Falls back to the previous per-layer raster snapshots when the style
    // produced no queryable geometry, so the export is never blank.
    const mapLayerDataUrls = vectorMapLayers
      ? []
      : await captureMapLayersAsDataUrls(exportMap, exportWidth, exportHeight);

    const overlayLayers: { id: string; dataUrl: string }[] = [];

    if (showOverlay) {
      overlayLayers.push({
        id: "fades",
        dataUrl: canvasToDataUrl(exportWidth, exportHeight, (ctx) => {
          applyFades(ctx, exportWidth, exportHeight, theme.ui.bg);
        }),
      });
    }

    if (routes.length > 0) {
      const routesCanvas = document.createElement("canvas");
      routesCanvas.width = exportWidth;
      routesCanvas.height = exportHeight;
      const routesCtx = routesCanvas.getContext("2d");
      if (routesCtx) {
        drawRoutesOnCanvas(
          routesCtx,
          routes,
          markerProjection,
          markerScaleX,
          markerScaleY,
          markerSizeScale,
        );
        overlayLayers.push({
          id: "routes",
          dataUrl: routesCanvas.toDataURL("image/png"),
        });
      }
    }

    if (routes.length > 0 && markerIcons.length > 0) {
      const endpointItems = routeEndpointMarkerItems(routes);
      if (endpointItems.length > 0) {
        const endpointsCanvas = document.createElement("canvas");
        endpointsCanvas.width = exportWidth;
        endpointsCanvas.height = exportHeight;
        const endpointsCtx = endpointsCanvas.getContext("2d");
        if (endpointsCtx) {
          await drawMarkersOnCanvas(
            endpointsCtx,
            endpointItems,
            markerIcons,
            markerProjection,
            markerScaleX,
            markerScaleY,
            markerSizeScale,
          );
          overlayLayers.push({
            id: "route-endpoints",
            dataUrl: endpointsCanvas.toDataURL("image/png"),
          });
        }
      }
    }

    if (markers.length > 0 && markerIcons.length > 0) {
      // drawMarkersOnCanvas is async; render through explicit await canvas path.
      const markersCanvas = document.createElement("canvas");
      markersCanvas.width = exportWidth;
      markersCanvas.height = exportHeight;
      const markersCtx = markersCanvas.getContext("2d");
      if (markersCtx) {
        await drawMarkersOnCanvas(
          markersCtx,
          markers,
          markerIcons,
          markerProjection,
          markerScaleX,
          markerScaleY,
          markerSizeScale,
        );
        overlayLayers.push({
          id: "markers",
          dataUrl: markersCanvas.toDataURL("image/png"),
        });
      }
    }

    overlayLayers.push({
      id: "text",
      dataUrl: canvasToDataUrl(exportWidth, exportHeight, (ctx) => {
        drawPosterText(
          ctx,
          exportWidth,
          exportHeight,
          theme,
          { lat: center.lat, lon: center.lon },
          displayCity,
          displayCountry,
          fontFamily,
          showPosterText,
          showOverlay,
          includeCredits,
        );
      }),
    });

    const toImageLayer = (layer: { id: string; dataUrl: string }) => ({
      id: layer.id,
      markup: `<image href="${layer.dataUrl}" width="${exportWidth}" height="${exportHeight}" preserveAspectRatio="none" />`,
    });

    const mapGroups = toSvgGroups(
      "map-layer",
      vectorMapLayers ?? mapLayerDataUrls.map(toImageLayer),
    );
    const overlayGroups = toSvgGroups(
      "overlay-layer",
      overlayLayers.map(toImageLayer),
    );

    // Vector geometry extends past the poster edge; the clip keeps the artwork
    // inside the page instead of relying on viewBox overflow behaviour.
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${exportWidth}" height="${exportHeight}" viewBox="0 0 ${exportWidth} ${exportHeight}">
<defs><clipPath id="poster-frame"><rect width="${exportWidth}" height="${exportHeight}" /></clipPath></defs>
<g clip-path="url(#poster-frame)">
${mapGroups}
${overlayGroups}
</g>
</svg>`;

    return new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  } finally {
    exportMap.remove();
    offscreenContainer.remove();
  }
}
