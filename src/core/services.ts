/**
 * Pre-instantiated infrastructure services.
 *
 * This module creates singleton instances of the hexagonal adapters,
 * wiring them to the concrete cache and HTTP implementations.
 * Application hooks import from here instead of calling factories directly.
 */

import { localStorageCache } from "@/core/cache/localStorageCache";
import { fetchAdapter } from "@/core/http/fetchAdapter";
import { googleFontsAdapter } from "@/core/fonts/googleFontsAdapter";
import { createNominatimAdapter } from "@/features/location/infrastructure/nominatimAdapter";
import { createOverpassAdapter } from "@/features/map/infrastructure/overpassAdapter";

/* ── Location / Geocoding ── */

const nominatim = createNominatimAdapter(fetchAdapter, localStorageCache);

export const searchLocations = nominatim.searchLocations;
export const geocodeLocation = nominatim.geocodeLocation;

/* ── Map data ── */

const overpass = createOverpassAdapter(fetchAdapter, localStorageCache);

export const fetchMapData = overpass.fetchMapData;

/* ── Fonts ── */

export const ensureGoogleFont =
  googleFontsAdapter.ensureFont.bind(googleFontsAdapter);

/* ── Poster rendering ── */

export { renderPoster } from "@/features/poster/infrastructure/renderer";

/* ── Export helpers ── */

export { createPngBlob } from "@/features/export/infrastructure/pngExporter";

export { createPdfBlobFromCanvas } from "@/features/export/infrastructure/pdfExporter";

export { createPosterFilename } from "@/features/export/infrastructure/filenameGenerator";

export { triggerDownloadBlob } from "@/features/export/infrastructure/fileDownloader";
