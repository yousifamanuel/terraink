import { useCallback } from "react";
import { usePosterContext } from "@/features/poster/ui/PosterContext";
import {
  createPdfBlobFromCanvas,
  createPosterFilename,
  triggerDownloadBlob,
} from "@/core/services";

/**
 * Provides handlers for downloading the poster as PNG or PDF.
 */
export function useExport() {
  const { state, canvasRef } = usePosterContext();
  const { form } = state;

  const handleDownloadPng = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (!blob) return;
      const filename = createPosterFilename(
        form.displayCity || form.location,
        form.theme,
        "png",
      );
      triggerDownloadBlob(blob, filename);
    }, "image/png");
  }, [canvasRef, form.displayCity, form.location, form.theme]);

  const handleDownloadPdf = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const pdfBlob = createPdfBlobFromCanvas(canvas, {
      widthCm: Number(form.width),
      heightCm: Number(form.height),
    });
    const filename = createPosterFilename(
      form.displayCity || form.location,
      form.theme,
      "pdf",
    );
    triggerDownloadBlob(pdfBlob, filename);
  }, [
    canvasRef,
    form.displayCity,
    form.location,
    form.theme,
    form.width,
    form.height,
  ]);

  return { handleDownloadPng, handleDownloadPdf };
}
