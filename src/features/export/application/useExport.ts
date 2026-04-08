import { useCallback, useState } from "react";
import { usePosterContext } from "@/features/poster/ui/PosterContext";
import { localStorageCache } from "@/core/cache/localStorageCache";
import type { ExportFormat } from "@/features/export/domain/types";
import { captureMapAsCanvas } from "@/features/export/infrastructure/mapExporter";
import { compositeExport } from "@/features/poster/infrastructure/renderer";
import { resolveCanvasSize } from "@/features/poster/infrastructure/renderer/canvas";
import { getAllMarkerIcons } from "@/features/markers/infrastructure/iconRegistry";
import { ensureGoogleFont } from "@/core/services";
import {
  createPngBlob,
  createPdfBlobFromCanvas,
  createLayeredSvgBlobFromMap,
  createPosterFilename,
  triggerDownloadBlob,
} from "@/core/services";
import {
  CM_PER_INCH,
  DEFAULT_POSTER_WIDTH_CM,
  DEFAULT_POSTER_HEIGHT_CM,
} from "@/core/config";

const EXPORT_COUNT_STORAGE_KEY = "terraink.poster.count";

export interface SupportPromptState {
  posterNumber: number;
}

// Use a 1-year TTL so the export count persists across sessions.
const EXPORT_COUNT_TTL_MS = 365 * 24 * 60 * 60 * 1000;

function readPosterExportCount(): number {
  const stored = localStorageCache.read<number>(
    EXPORT_COUNT_STORAGE_KEY,
    EXPORT_COUNT_TTL_MS,
  );
  if (typeof stored === "number" && Number.isFinite(stored) && stored >= 0) {
    return Math.floor(stored);
  }
  return 0;
}

function writePosterExportCount(nextCount: number): void {
  localStorageCache.write(EXPORT_COUNT_STORAGE_KEY, nextCount);
}

/**
 * Provides handlers for exporting the live poster preview as PNG or PDF.
 *
 * Flow:
 * 1. Resize MapLibre container to full export resolution.
 * 2. Wait for tiles at new resolution.
 * 3. Snapshot the WebGL canvas.
 * 4. Composite fades + text onto the snapshot.
 * 5. Download.
 */
export function useExport() {
  const { state, dispatch, effectiveTheme, mapRef } = usePosterContext();
  const [supportPrompt, setSupportPrompt] = useState<SupportPromptState | null>(
    null,
  );
  const { form } = state;
  const hasVisibleMarkers = state.markers.length > 0;

  const registerSuccessfulExport = useCallback(() => {
    const nextCount = readPosterExportCount() + 1;
    writePosterExportCount(nextCount);

    if (nextCount % 5 === 0) {
      setSupportPrompt({ posterNumber: nextCount });
    }
  }, []);

  const dismissSupportPrompt = useCallback(() => {
    setSupportPrompt(null);
  }, []);

  const exportPoster = useCallback(
    async (format: ExportFormat) => {
      const map = mapRef.current;
      if (!map) {
        dispatch({ type: "SET_ERROR", error: "Map is not ready." });
        return;
      }

      dispatch({ type: "SET_EXPORT_STATUS", exporting: true });

      try {
        // Ensure font is loaded before compositing text
        if (form.showPosterText && form.fontFamily.trim()) {
          await ensureGoogleFont(form.fontFamily.trim());
        }

        const widthCm = Number(form.width) || DEFAULT_POSTER_WIDTH_CM;
        const heightCm = Number(form.height) || DEFAULT_POSTER_HEIGHT_CM;
        const dpi = 300;
        const widthInches = widthCm / CM_PER_INCH;
        const heightInches = heightCm / CM_PER_INCH;

        const size = resolveCanvasSize(widthInches, heightInches);

        const lat = Number(form.latitude) || 0;
        const lon = Number(form.longitude) || 0;

        if (format === "svg") {
          const svgBlob = await createLayeredSvgBlobFromMap({
            map,
            exportWidth: size.width,
            exportHeight: size.height,
            theme: effectiveTheme,
            center: { lat, lon },
            displayCity: form.displayCity || form.location || "",
            displayCountry: form.displayCountry || "",
            fontFamily: form.fontFamily.trim(),
            showPosterText: form.showPosterText,
            showOverlay: form.showMarkers,
            includeCredits: form.includeCredits,
            markers: hasVisibleMarkers ? state.markers : [],
            markerIcons: hasVisibleMarkers
              ? getAllMarkerIcons(state.customMarkerIcons)
              : [],
          });
          const svgFilename = createPosterFilename(
            form.displayCity || form.location,
            form.theme,
            "svg",
          );
          await triggerDownloadBlob(svgBlob, svgFilename);
          registerSuccessfulExport();
          dispatch({ type: "SET_EXPORT_STATUS", exporting: false });
          return;
        }

        // 1. Capture map at full export resolution
        const {
          canvas: mapCanvas,
          markerProjection,
          markerScaleX,
          markerScaleY,
          markerSizeScale,
        } = await captureMapAsCanvas(map, size.width, size.height);

        // 2. Composite fades + text
        const { canvas } = await compositeExport(mapCanvas, {
          theme: effectiveTheme,
          center: { lat, lon },
          widthInches,
          heightInches,
          displayCity: form.displayCity || form.location || "",
          displayCountry: form.displayCountry || "",
          fontFamily: form.fontFamily.trim(),
          showPosterText: form.showPosterText,
          showOverlay: form.showMarkers,
          includeCredits: form.includeCredits,
          markers: hasVisibleMarkers ? state.markers : [],
          markerIcons: hasVisibleMarkers
            ? getAllMarkerIcons(state.customMarkerIcons)
            : [],
          markerProjection: hasVisibleMarkers ? markerProjection : undefined,
          markerScaleX: hasVisibleMarkers ? markerScaleX : undefined,
          markerScaleY: hasVisibleMarkers ? markerScaleY : undefined,
          markerSizeScale: hasVisibleMarkers ? markerSizeScale : undefined,
        });

        // 3. Download
        const filename = createPosterFilename(
          form.displayCity || form.location,
          form.theme,
          format,
        );

        if (format === "pdf") {
          const pdfBlob = createPdfBlobFromCanvas(canvas, {
            widthCm,
            heightCm,
          });
          await triggerDownloadBlob(pdfBlob, filename);
        } else {
          const pngBlob = await createPngBlob(canvas, dpi);
          await triggerDownloadBlob(pngBlob, filename);
        }

        registerSuccessfulExport();
        dispatch({ type: "SET_EXPORT_STATUS", exporting: false });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Export failed.";
        dispatch({ type: "SET_EXPORT_STATUS", exporting: false, error: message });
      }
    },
    [
      mapRef,
      form,
      effectiveTheme,
      dispatch,
      hasVisibleMarkers,
      registerSuccessfulExport,
      state.markers,
      state.customMarkerIcons,
    ],
  );

  const handleDownloadPng = useCallback(
    () => exportPoster("png"),
    [exportPoster],
  );

  const handleDownloadPdf = useCallback(
    () => exportPoster("pdf"),
    [exportPoster],
  );

  const handleDownloadSvg = useCallback(
    () => exportPoster("svg"),
    [exportPoster],
  );

  return {
    isExporting: state.isExporting,
    handleDownloadPng,
    handleDownloadPdf,
    handleDownloadSvg,
    supportPrompt,
    dismissSupportPrompt,
  };
}
