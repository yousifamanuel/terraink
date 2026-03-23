import { useCallback, useState } from "react";
import { useLocale } from "@/core/i18n/LocaleContext";
import { usePosterContext } from "@/features/poster/ui/PosterContext";
import { captureMapAsCanvas } from "@/features/export/infrastructure/mapExporter";
import { compositeExport } from "@/features/poster/infrastructure/renderer";
import { resolveCanvasSize } from "@/features/poster/infrastructure/renderer/canvas";
import { OUTPUT_DPI } from "@/features/poster/infrastructure/renderer/constants";
import { getAllMarkerIcons } from "@/features/markers/infrastructure/iconRegistry";
import { ensureFontVariant } from "@/core/services";
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

function readPosterExportCount(): number {
  if (typeof window === "undefined" || !window.localStorage) {
    return 0;
  }

  try {
    const raw = window.localStorage.getItem(EXPORT_COUNT_STORAGE_KEY);
    const parsed = Number(raw);
    if (!Number.isFinite(parsed) || parsed < 0) {
      return 0;
    }
    return Math.floor(parsed);
  } catch {
    return 0;
  }
}

function writePosterExportCount(nextCount: number): void {
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }

  try {
    window.localStorage.setItem(EXPORT_COUNT_STORAGE_KEY, String(nextCount));
  } catch {
    // Ignore storage write failures (quota/private mode).
  }
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
  const { t } = useLocale();
  const { state, dispatch, effectiveTheme, mapRef } = usePosterContext();
  const [supportPrompt, setSupportPrompt] = useState<SupportPromptState | null>(
    null,
  );
  const { form } = state;
  const hasVisibleMarkers = form.showMarkers && state.markers.length > 0;

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
    async (format: "png" | "pdf" | "svg") => {
      const map = mapRef.current;
      if (!map) {
        dispatch({ type: "SET_ERROR", error: t("export.error.mapNotReady") });
        return;
      }

      dispatch({ type: "START_EXPORT" });

      try {
        // Ensure font is loaded before compositing text
        if (form.showPosterText) {
          await ensureFontVariant({
            fontFamily: form.fontFamily,
            fontVariant: form.fontVariant,
          });
        }

        const widthCm = Number(form.width) || DEFAULT_POSTER_WIDTH_CM;
        const heightCm = Number(form.height) || DEFAULT_POSTER_HEIGHT_CM;
        const dpi = OUTPUT_DPI;
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
            fontVariant: form.fontVariant,
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
          triggerDownloadBlob(svgBlob, svgFilename);
          registerSuccessfulExport();
          dispatch({ type: "FINISH_EXPORT" });
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
          fontVariant: form.fontVariant,
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
          triggerDownloadBlob(pdfBlob, filename);
        } else {
          const pngBlob = await createPngBlob(canvas, dpi);
          triggerDownloadBlob(pngBlob, filename);
        }

        registerSuccessfulExport();
        dispatch({ type: "FINISH_EXPORT" });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : t("export.error.failed");
        dispatch({ type: "FAIL_EXPORT", error: message });
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
      t,
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
    handleDownloadPng,
    handleDownloadPdf,
    handleDownloadSvg,
    supportPrompt,
    dismissSupportPrompt,
  };
}
