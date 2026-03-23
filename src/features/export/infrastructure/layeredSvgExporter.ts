import maplibregl, {
  type Map as MaplibreMap,
  type StyleSpecification,
} from "maplibre-gl";
import type {
  MarkerIconDefinition,
  MarkerItem,
  MarkerProjectionInput,
} from "@/features/markers/domain/types";
import { drawMarkersOnCanvas } from "@/features/markers/infrastructure/rendering";
import { applyFades } from "@/features/poster/infrastructure/renderer/layers";
import { drawPosterText } from "@/features/poster/infrastructure/renderer/typography";
import { MAP_OVERZOOM_SCALE } from "@/features/map/infrastructure/constants";
import type { ResolvedTheme } from "@/features/theme/domain/types";

const EXPORT_MAP_TIMEOUT_MS = 15_000;

interface LayeredSvgOptions {
  map: MaplibreMap;
  exportWidth: number;
  exportHeight: number;
  theme: ResolvedTheme;
  center: { lat: number; lon: number };
  displayCity: string;
  displayCountry: string;
  fontFamily?: string;
  fontVariant?: string;
  showPosterText: boolean;
  showOverlay: boolean;
  includeCredits: boolean;
  markers: MarkerItem[];
  markerIcons: MarkerIconDefinition[];
}

function waitForMapIdle(map: MaplibreMap): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    let settled = false;
    const timeout = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      reject(new Error("Timed out while waiting for map tiles to render."));
    }, EXPORT_MAP_TIMEOUT_MS);

    const finish = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeout);
      resolve();
    };

    if (map.loaded() && !map.isMoving()) {
      finish();
      return;
    }

    map.once("idle", finish);
  });
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

export async function createLayeredSvgBlobFromMap({
  map,
  exportWidth,
  exportHeight,
  theme,
  center,
  displayCity,
  displayCountry,
  fontFamily,
  fontVariant,
  showPosterText,
  showOverlay,
  includeCredits,
  markers,
  markerIcons,
}: LayeredSvgOptions): Promise<Blob> {
  await waitForMapIdle(map);

  const internalMapContainer = map.getContainer();
  const visibleContainer = internalMapContainer.parentElement;
  const visiblePreviewWidth =
    visibleContainer?.clientWidth ||
    Math.round(internalMapContainer.clientWidth / MAP_OVERZOOM_SCALE);
  const visiblePreviewHeight =
    visibleContainer?.clientHeight ||
    Math.round(internalMapContainer.clientHeight / MAP_OVERZOOM_SCALE);
  const previewWidth = Math.max(visiblePreviewWidth, 1);
  const previewHeight = Math.max(visiblePreviewHeight, 1);

  const currentCenter = map.getCenter();
  const currentZoom = map.getZoom();
  const currentPitch = map.getPitch();
  const currentBearing = map.getBearing();
  const style = map.getStyle() as StyleSpecification;

  const widthScale = Math.max(exportWidth / previewWidth, 1);
  const heightScale = Math.max(exportHeight / previewHeight, 1);
  const basePixelRatio = Math.max(widthScale, heightScale, 1);

  const renderWidth = Math.max(1, Math.round(previewWidth * MAP_OVERZOOM_SCALE));
  const renderHeight = Math.max(1, Math.round(previewHeight * MAP_OVERZOOM_SCALE));
  const pixelRatio = Math.max(basePixelRatio / MAP_OVERZOOM_SCALE, 1);

  const markerProjection: MarkerProjectionInput = {
    centerLat: currentCenter.lat,
    centerLon: currentCenter.lng,
    zoom: currentZoom,
    bearingDeg: currentBearing,
    canvasWidth: renderWidth,
    canvasHeight: renderHeight,
  };
  const markerScaleX = exportWidth / renderWidth;
  const markerScaleY = exportHeight / renderHeight;
  const markerSizeScale = MAP_OVERZOOM_SCALE;

  const offscreenContainer = document.createElement("div");
  offscreenContainer.style.position = "fixed";
  offscreenContainer.style.left = "-100000px";
  offscreenContainer.style.top = "0";
  offscreenContainer.style.width = `${renderWidth}px`;
  offscreenContainer.style.height = `${renderHeight}px`;
  offscreenContainer.style.pointerEvents = "none";
  offscreenContainer.style.opacity = "0";
  document.body.appendChild(offscreenContainer);

  const exportMap = new maplibregl.Map({
    container: offscreenContainer,
    style,
    center: [currentCenter.lng, currentCenter.lat],
    zoom: currentZoom,
    pitch: currentPitch,
    bearing: currentBearing,
    interactive: false,
    attributionControl: false,
    pixelRatio,
    canvasContextAttributes: { preserveDrawingBuffer: true },
  });

  try {
    await waitForMapIdle(exportMap);

    const exportStyle = exportMap.getStyle();
    const layerIds = (exportStyle.layers ?? []).map((layer) => layer.id);
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

    const mapLayerDataUrls: { id: string; dataUrl: string }[] = [];
    for (const layerId of visibleLayerIds) {
      exportMap.setLayoutProperty(layerId, "visibility", "visible");
      await waitForMapIdle(exportMap);
      mapLayerDataUrls.push({
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
      const visibility = originalVisibility.get(layerId) ?? "visible";
      exportMap.setLayoutProperty(layerId, "visibility", visibility);
    }
    await waitForMapIdle(exportMap);

    const overlayLayers: { id: string; dataUrl: string }[] = [];

    if (showOverlay) {
      overlayLayers.push({
        id: "fades",
        dataUrl: canvasToDataUrl(exportWidth, exportHeight, (ctx) => {
          applyFades(ctx, exportWidth, exportHeight, theme.ui.bg);
        }),
      });
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
          fontVariant,
          showPosterText,
          showOverlay,
          includeCredits,
        );
      }),
    });

    const mapLayerGroups = mapLayerDataUrls
      .map(
        (layer) => `<g id="map-layer-${sanitizeLayerId(layer.id)}">
  <image href="${layer.dataUrl}" width="${exportWidth}" height="${exportHeight}" preserveAspectRatio="none" />
</g>`,
      )
      .join("\n");

    const overlayGroups = overlayLayers
      .map(
        (layer) => `<g id="overlay-layer-${sanitizeLayerId(layer.id)}">
  <image href="${layer.dataUrl}" width="${exportWidth}" height="${exportHeight}" preserveAspectRatio="none" />
</g>`,
      )
      .join("\n");

    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${exportWidth}" height="${exportHeight}" viewBox="0 0 ${exportWidth} ${exportHeight}">
${mapLayerGroups}
${overlayGroups}
</svg>`;

    return new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  } finally {
    exportMap.remove();
    offscreenContainer.remove();
  }
}
