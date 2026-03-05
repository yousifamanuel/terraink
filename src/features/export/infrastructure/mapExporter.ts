import maplibregl, {
  type Map as MaplibreMap,
  type StyleSpecification,
} from "maplibre-gl";
import { MAP_OVERZOOM_SCALE } from "@/features/map/infrastructure/constants";
import type { MarkerStyle } from "@/features/poster/application/posterReducer";

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

function buildMarkerSvg(style: MarkerStyle, color: string, size: number): string {
  switch (style) {
    case "pin": {
      const w = Math.round(size * 0.75);
      const h = Math.round(size * 1.05);
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 42" width="${w}" height="${h}">
        <path d="M15 0C6.716 0 0 6.716 0 15c0 10.5 15 27 15 27s15-16.5 15-27C30 6.716 23.284 0 15 0z" fill="${color}" stroke="rgba(0,0,0,0.3)" stroke-width="1.5"/>
        <circle cx="15" cy="14" r="6" fill="rgba(0,0,0,0.25)"/>
      </svg>`;
    }
    case "circle":
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="${size}" height="${size}">
        <circle cx="20" cy="20" r="16" fill="${color}" stroke="rgba(255,255,255,0.8)" stroke-width="3"/>
        <circle cx="20" cy="20" r="6" fill="rgba(255,255,255,0.9)"/>
      </svg>`;
    case "target":
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="${size}" height="${size}">
        <circle cx="20" cy="20" r="16" fill="none" stroke="${color}" stroke-width="3"/>
        <circle cx="20" cy="20" r="8" fill="none" stroke="${color}" stroke-width="2"/>
        <circle cx="20" cy="20" r="3" fill="${color}"/>
        <line x1="20" y1="0" x2="20" y2="7" stroke="${color}" stroke-width="2"/>
        <line x1="20" y1="33" x2="20" y2="40" stroke="${color}" stroke-width="2"/>
        <line x1="0" y1="20" x2="7" y2="20" stroke="${color}" stroke-width="2"/>
        <line x1="33" y1="20" x2="40" y2="20" stroke="${color}" stroke-width="2"/>
      </svg>`;
    case "diamond":
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="${size}" height="${size}">
        <polygon points="20,2 38,20 20,38 2,20" fill="${color}" stroke="rgba(255,255,255,0.8)" stroke-width="2"/>
        <polygon points="20,10 30,20 20,30 10,20" fill="rgba(255,255,255,0.3)"/>
      </svg>`;
    case "star": {
      const cx = 20, cy = 20, outerR = 18, innerR = 8;
      let points = "";
      for (let i = 0; i < 10; i++) {
        const r = i % 2 === 0 ? outerR : innerR;
        const angle = (Math.PI / 2) + (i * Math.PI) / 5;
        const x = cx + r * Math.cos(angle);
        const y = cy - r * Math.sin(angle);
        points += `${x.toFixed(1)},${y.toFixed(1)} `;
      }
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="${size}" height="${size}">
        <polygon points="${points.trim()}" fill="${color}" stroke="rgba(255,255,255,0.8)" stroke-width="1.5"/>
      </svg>`;
    }
  }
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

    const svgStr = buildMarkerSvg(marker.style, marker.color, exportSize);
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

