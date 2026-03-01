import type { Map as MaplibreMap } from "maplibre-gl";

/**
 * Captures the currently visible map view and scales it to export size.
 * This keeps export WYSIWYG with the on-screen preview.
 */
export async function captureMapAsCanvas(
  map: MaplibreMap,
  exportWidth: number,
  exportHeight: number,
): Promise<HTMLCanvasElement> {
  await new Promise<void>((resolve) => {
    if (map.loaded() && !map.isMoving()) {
      resolve();
    } else {
      map.once("idle", () => resolve());
    }
  });

  const glCanvas = map.getCanvas();
  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = exportWidth;
  exportCanvas.height = exportHeight;
  const ctx = exportCanvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not create 2D context for export canvas");
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(
    glCanvas,
    0,
    0,
    glCanvas.width,
    glCanvas.height,
    0,
    0,
    exportWidth,
    exportHeight,
  );

  return exportCanvas;
}
