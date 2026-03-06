import maplibregl, {
  type Map as MaplibreMap,
  type StyleSpecification,
} from "maplibre-gl";
import { MAP_OVERZOOM_SCALE } from "@/features/map/infrastructure/constants";
import type { MarkerStyle } from "@/features/marker/domain/types";
import { buildMarkerSvgString } from "@/features/marker/domain/markerShapes";

const EXPORT_MAP_TIMEOUT_MS = 15_000;

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

/* ── Marker SVG generators ── */

export interface ExportMarkerOptions {
  show: boolean;
  style: MarkerStyle;
  color: string;
  size: number;
  lngLat: [number, number];
}



function drawMarkerOnCanvas(
  ctx: CanvasRenderingContext2D,
  exportMap: MaplibreMap,
  marker: ExportMarkerOptions,
  exportWidth: number,
  exportHeight: number,
): Promise<void> {
  return new Promise((resolve) => {
    if (!marker.show) { resolve(); return; }

    const pixel = exportMap.project(new maplibregl.LngLat(marker.lngLat[0], marker.lngLat[1]));
    const canvasEl = exportMap.getCanvas();
    const scaleX = exportWidth / canvasEl.width;
    const scaleY = exportHeight / canvasEl.height;
    const px = pixel.x * canvasEl.width / exportMap.getContainer().clientWidth * scaleX;
    const py = pixel.y * canvasEl.height / exportMap.getContainer().clientHeight * scaleY;

    // Scale marker size proportionally to export resolution
    const previewContainer = exportMap.getContainer();
    const sizeScale = Math.max(exportWidth / previewContainer.clientWidth, 1);
    const exportSize = Math.round(marker.size * sizeScale);

    const svgStr = buildMarkerSvgString(marker.style, marker.color, exportSize);
    const blob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      if (marker.style === "pin") {
        // Pin anchors at bottom-center
        ctx.drawImage(img, px - img.width / 2, py - img.height);
      } else {
        // All others anchor at center
        ctx.drawImage(img, px - img.width / 2, py - img.height / 2);
      }
      URL.revokeObjectURL(url);
      resolve();
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(); // Don't fail export if marker fails
    };
    img.src = url;
  });
}

/**
 * Captures the currently visible map view at full export resolution.
 * Uses a hidden offscreen map so PNG/PDF output remains sharp.
 */
export async function captureMapAsCanvas(
  map: MaplibreMap,
  exportWidth: number,
  exportHeight: number,
  marker?: ExportMarkerOptions,
): Promise<HTMLCanvasElement> {
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
  const center = map.getCenter();
  const zoom = map.getZoom();
  const pitch = map.getPitch();
  const bearing = map.getBearing();
  const style = map.getStyle() as StyleSpecification;
  const widthScale = Math.max(exportWidth / previewWidth, 1);
  const heightScale = Math.max(exportHeight / previewHeight, 1);
  // Keep CSS viewport equal to preview and increase device pixels for sharpness.
  const basePixelRatio = Math.max(widthScale, heightScale, 1);

  /**
   * Match preview over-zoom behavior in export:
   * - Expand internal viewport by fixed over-zoom scale to preserve framing.
   * - Reduce pixelRatio by the same factor so output resolution stays bounded.
   */
  const renderWidth = Math.max(1, Math.round(previewWidth * MAP_OVERZOOM_SCALE));
  const renderHeight = Math.max(1, Math.round(previewHeight * MAP_OVERZOOM_SCALE));
  const pixelRatio = Math.max(basePixelRatio / MAP_OVERZOOM_SCALE, 1);

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
    center: [center.lng, center.lat],
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

    const glCanvas = exportMap.getCanvas();
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = exportWidth;
    exportCanvas.height = exportHeight;
    const ctx = exportCanvas.getContext("2d");
    if (!ctx) {
      throw new Error("Could not create 2D context for export canvas");
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(glCanvas, 0, 0, exportWidth, exportHeight);

    // Draw marker on canvas if enabled
    if (marker?.show) {
      await drawMarkerOnCanvas(ctx, exportMap, marker, exportWidth, exportHeight);
    }

    return exportCanvas;
  } finally {
    exportMap.remove();
    offscreenContainer.remove();
  }
}

