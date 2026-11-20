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
export {
  loadFavoriteThemeIds,
  saveFavoriteThemeIds,
} from "@/features/theme/infrastructure/favoriteThemesStorage";
export {
  loadStartupWindowHidden,
  saveStartupWindowHidden,
} from "@/features/location/infrastructure/startupWindowStorage";
export {
  loadAllTimeDownloadCount,
  saveAllTimeDownloadCount,
} from "@/features/export/infrastructure/downloadCountStorage";
export {
  loadVideoGuideState,
  saveVideoGuideState,
} from "@/features/export/infrastructure/videoGuideStorage";
export {
  fetchUpdateReleases,
  resolveUpdateImage,
  loadNewsSeenVersion,
  saveNewsSeenVersion,
} from "@/features/updates/infrastructure/updatesFeed";

/* ── Campaigns ── */

export { loadBundledCampaigns } from "@/features/campaigns/infrastructure/campaignBundle";
export {
  isCampaignSeen,
  markCampaignSeen,
} from "@/features/campaigns/infrastructure/campaignPrefsStorage";
export { getTheme, registerThemes } from "@/features/theme/infrastructure/themeRepository";

/* ── App theme ── */

export {
  applyAppThemeVars,
  loadAppThemeFollow,
  saveAppThemeFollow,
} from "@/features/appTheme/infrastructure/appThemeDocument";
export {
  defaultThemeName,
  getThemeAppSection,
} from "@/features/theme/infrastructure/themeRepository";

/* ── Analytics ── */

export { trackEvent, setUserProperty } from "@/core/analytics/gtagAnalytics";
export { loadAds } from "@/core/ads/adsenseLoader";

/* ── Legal docs ── */

export { fetchMarkdownDoc } from "@/features/legal/infrastructure/legalDocsAdapter";

/* ── Routes ── */

export { gpxParser } from "@/features/routes/infrastructure/gpxParser";
export { drawRoutesOnCanvas } from "@/features/routes/infrastructure/rendering";
