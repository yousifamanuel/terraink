/**
 * Pre-instantiated infrastructure services.
 *
 * This module creates singleton instances of the hexagonal adapters,
 * wiring them to the concrete cache and HTTP implementations.
 * Application hooks import from here instead of calling factories directly.
 */

import { localStorageCache } from "@/core/cache/localStorageCache";
import { fetchAdapter } from "@/core/http/fetchAdapter";
import { localFontsAdapter } from "@/core/fonts/localFontsAdapter";
import { createNominatimAdapter } from "@/features/location/infrastructure/nominatimAdapter";
import { createRecentLocationsStore } from "@/features/location/infrastructure/recentLocationsStore";

/* ── Location / Geocoding ── */

const nominatim = createNominatimAdapter(fetchAdapter, localStorageCache);

export const searchLocations = nominatim.searchLocations;
export const geocodeLocation = nominatim.geocodeLocation;
export const reverseGeocodeCoordinates = nominatim.reverseGeocode;

/* ── Recent location history ── */

const recentLocations = createRecentLocationsStore();

export const listRecentLocations = recentLocations.list;
export const addRecentLocation = recentLocations.add;
export const removeRecentLocation = recentLocations.remove;
export const clearRecentLocations = recentLocations.clear;

/* ── Fonts ── */

export const ensureFont =
  localFontsAdapter.ensureFont.bind(localFontsAdapter);

/* ── Poster compositing ── */

export { compositeExport } from "@/features/poster/infrastructure/renderer";

/* ── Export helpers ── */

export { captureMapAsCanvas } from "@/features/export/infrastructure/mapExporter";

export { createPngBlob } from "@/features/export/infrastructure/pngExporter";
export { createLayeredSvgBlobFromMap } from "@/features/export/infrastructure/layeredSvgExporter";

export { createPdfBlobFromCanvas } from "@/features/export/infrastructure/pdfExporter";

export { createPosterFilename } from "@/features/export/infrastructure/filenameGenerator";

export { triggerDownloadBlob } from "@/features/export/infrastructure/fileDownloader";

/* ── Analytics ── */

export { trackEvent, setUserProperty } from "@/core/analytics/gtagAnalytics";

/* ── Legal docs ── */

export { fetchMarkdownDoc } from "@/features/legal/infrastructure/legalDocsAdapter";

/* ── Routes ── */

export { gpxParser } from "@/features/routes/infrastructure/gpxParser";
export { drawRoutesOnCanvas } from "@/features/routes/infrastructure/rendering";
