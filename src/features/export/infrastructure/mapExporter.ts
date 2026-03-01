import type { Map as MaplibreMap } from "maplibre-gl";
import { MIN_MAP_ZOOM, MAX_MAP_ZOOM } from "@/core/config";

/**
 * Captures a high-resolution map canvas while preserving the same geographic
 * framing as the on-screen preview.
 */
export async function captureMapAsCanvas(
  map: MaplibreMap,
  exportWidth: number,
  exportHeight: number,
): Promise<HTMLCanvasElement> {
  const container = map.getContainer();
  const originalStyleWidth = container.style.width;
  const originalStyleHeight = container.style.height;
  const originalClientWidth = Math.max(container.clientWidth, 1);
  const originalClientHeight = Math.max(container.clientHeight, 1);
  const originalCenter = map.getCenter();
  const originalZoom = map.getZoom();
  const originalPitch = map.getPitch();
  const originalBearing = map.getBearing();
  const originalMinZoom = map.getMinZoom();
  const originalMaxZoom = map.getMaxZoom();

  try {
    container.style.width = `${exportWidth}px`;
    container.style.height = `${exportHeight}px`;
    map.resize();
    map.setMinZoom(MIN_MAP_ZOOM);
    map.setMaxZoom(MAX_MAP_ZOOM);

    // Keep the visible map extent identical after resizing by adjusting zoom.
    const widthScale = exportWidth / originalClientWidth;
    const heightScale = exportHeight / originalClientHeight;
    const scale = Math.max(Math.min(widthScale, heightScale), 0.0001);
    const exportZoom = originalZoom + Math.log2(scale);

    map.jumpTo({
      center: originalCenter,
      zoom: exportZoom,
      pitch: originalPitch,
      bearing: originalBearing,
    });

    await new Promise<void>((resolve) => {
      if (map.loaded() && !map.isMoving()) {
        resolve();
      } else {
        map.once("idle", () => resolve());
      }
    });

    const glCanvas = map.getCanvas();
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = glCanvas.width;
    exportCanvas.height = glCanvas.height;
    const ctx = exportCanvas.getContext("2d");
    if (!ctx) {
      throw new Error("Could not create 2D context for export canvas");
    }

    ctx.drawImage(glCanvas, 0, 0);
    return exportCanvas;
  } finally {
    container.style.width = originalStyleWidth;
    container.style.height = originalStyleHeight;
    map.resize();
    map.setMinZoom(originalMinZoom);
    map.setMaxZoom(originalMaxZoom);
    map.jumpTo({
      center: originalCenter,
      zoom: originalZoom,
      pitch: originalPitch,
      bearing: originalBearing,
    });
  }
}
