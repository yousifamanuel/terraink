import { useEffect, useMemo, useRef, useState } from "react";
import FooterNote from "./components/footer/FooterNote";
import InfoPanel from "./components/info/InfoPanel";
import AppHeader from "./components/layout/AppHeader";
import PreviewPanel from "./components/preview/PreviewPanel";
import SettingsPanel from "./components/settings/SettingsPanel";
import {
  CM_PER_INCH,
  CONTACT_EMAIL,
  DEFAULT_FORM,
  LEGAL_NOTICE_URL,
  MAX_POSTER_CM,
  MIN_POSTER_CM,
  PRIVACY_URL,
  REPO_API_URL,
  REPO_URL,
  FONT_OPTIONS,
} from "./constants/appConfig";
import { useLocationAutocomplete } from "./hooks/useLocationAutocomplete";
import { useRepoStars } from "./hooks/useRepoStars";
import { computePosterAndFetchBounds } from "./lib/geo";
import { fetchMapData, geocodeLocation } from "./lib/osm";
import { renderPoster } from "./lib/posterRenderer";
import { getTheme, themeOptions } from "./lib/themes";
import { createPosterFilename } from "./utils/download";
import { ensureGoogleFont } from "./utils/font";
import { parseLocationParts } from "./utils/location";
import { clamp, parseNumericInput } from "./utils/number";

export default function App() {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [isLocationFocused, setIsLocationFocused] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const canvasRef = useRef(null);
  const renderCacheRef = useRef(null);

  const selectedTheme = useMemo(() => getTheme(form.theme), [form.theme]);
  const themePalette = useMemo(
    () =>
      [
        selectedTheme.bg,
        selectedTheme.water,
        selectedTheme.parks,
        selectedTheme.road_primary,
        selectedTheme.road_secondary,
        selectedTheme.road_residential,
        selectedTheme.text,
      ].filter(Boolean),
    [selectedTheme],
  );

  const {
    locationSuggestions,
    isLocationSearching,
    clearLocationSuggestions,
  } = useLocationAutocomplete(form.location, isLocationFocused);

  const { repoStars, repoStarsLoading } = useRepoStars(REPO_API_URL);

  const contactEmail = String(CONTACT_EMAIL ?? "").trim();
  const legalNoticeUrl = String(LEGAL_NOTICE_URL ?? "").trim();
  const privacyUrl = String(PRIVACY_URL ?? "").trim();
  const hasFooterLinks = Boolean(contactEmail || legalNoticeUrl || privacyUrl);

  function handleChange(event) {
    const { name, value } = event.target;
    if (name === "location") {
      setSelectedLocation(null);
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleLocationSelect(suggestion) {
    setSelectedLocation(suggestion);
    clearLocationSuggestions();
    setIsLocationFocused(false);
    setForm((prev) => ({
      ...prev,
      location: suggestion.label,
      latitude: suggestion.lat.toFixed(6),
      longitude: suggestion.lon.toFixed(6),
    }));
  }

  function resolveTypography(renderCache) {
    return {
      displayCity: form.displayCity.trim() || renderCache.baseCity,
      displayCountry: form.displayCountry.trim() || renderCache.baseCountry,
      fontFamily: form.fontFamily.trim(),
    };
  }

  function renderWithCachedMap(theme, typographyOverride = null) {
    const renderCache = renderCacheRef.current;
    const canvas = canvasRef.current;
    if (!renderCache || !canvas) {
      return null;
    }

    const typography = typographyOverride ?? resolveTypography(renderCache);

    return renderPoster(canvas, {
      theme,
      mapData: renderCache.mapData,
      bounds: renderCache.bounds,
      center: renderCache.center,
      widthInches: renderCache.widthInches,
      heightInches: renderCache.heightInches,
      displayCity: typography.displayCity,
      displayCountry: typography.displayCountry,
      fontFamily: typography.fontFamily,
    });
  }

  async function runProgressTask(startPercent, endPercent, message, task) {
    const safeStart = clamp(Math.round(startPercent), 0, 100);
    const safeEnd = clamp(Math.round(endPercent), safeStart, 100);
    setStatus(message);
    setGenerationProgress((prev) => Math.max(prev, safeStart));

    let current = safeStart;
    const maxWhileRunning = Math.max(safeStart, safeEnd - 2);
    const stepSize = Math.max(1, Math.round((safeEnd - safeStart) / 8));
    const timerId = window.setInterval(() => {
      current = Math.min(current + stepSize, maxWhileRunning);
      setGenerationProgress((prev) => Math.max(prev, current));
    }, 250);

    try {
      return await task();
    } finally {
      window.clearInterval(timerId);
      setGenerationProgress((prev) => Math.max(prev, safeEnd));
    }
  }

  useEffect(() => {
    const renderCache = renderCacheRef.current;
    if (!renderCache) {
      return;
    }

    const typography = resolveTypography(renderCache);
    let cancelled = false;

    async function rerenderPreview() {
      const size = renderWithCachedMap(selectedTheme, typography);
      if (!size) {
        return;
      }

      setResult((prev) => (prev ? { ...prev, size } : prev));

      if (!typography.fontFamily) {
        return;
      }

      await ensureGoogleFont(typography.fontFamily);
      if (cancelled) {
        return;
      }

      const refreshedSize = renderWithCachedMap(selectedTheme, typography);
      if (!refreshedSize) {
        return;
      }

      setResult((prev) => (prev ? { ...prev, size: refreshedSize } : prev));
    }

    rerenderPreview();

    return () => {
      cancelled = true;
    };
  }, [selectedTheme, form.displayCity, form.displayCountry, form.fontFamily]);

  async function handleGenerate(event) {
    event.preventDefault();
    setError("");
    setStatus("");
    setResult(null);
    setGenerationProgress(0);
    setIsGenerating(true);

    try {
      setStatus("Validating input...");
      setGenerationProgress(8);

      const locationText = form.location.trim();
      if (!locationText) {
        throw new Error("Location is required.");
      }

      const widthCm = clamp(
        parseNumericInput("Width", form.width),
        MIN_POSTER_CM,
        MAX_POSTER_CM,
      );
      const heightCm = clamp(
        parseNumericInput("Height", form.height),
        MIN_POSTER_CM,
        MAX_POSTER_CM,
      );
      const widthInches = widthCm / CM_PER_INCH;
      const heightInches = heightCm / CM_PER_INCH;
      const distanceMeters = clamp(
        parseNumericInput("Distance", form.distance),
        1_000,
        50_000,
      );

      const latText = form.latitude.trim();
      const lonText = form.longitude.trim();
      const previousLocation =
        renderCacheRef.current?.baseLocation?.trim().toLowerCase() ?? "";
      const locationChanged = locationText.toLowerCase() !== previousLocation;
      const selectedMatchesInput =
        !!selectedLocation &&
        selectedLocation.label.trim().toLowerCase() ===
          locationText.toLowerCase();
      const fallbackParts = parseLocationParts(locationText);

      let resolvedLocation = null;
      let shouldAutofillFromLocation = false;

      if (selectedMatchesInput) {
        resolvedLocation = selectedLocation;
        shouldAutofillFromLocation = true;
      } else if (latText && lonText && !locationChanged) {
        resolvedLocation = {
          label: locationText,
          city: fallbackParts.city,
          country: fallbackParts.country,
          lat: parseNumericInput("Latitude", latText),
          lon: parseNumericInput("Longitude", lonText),
        };
      } else {
        resolvedLocation = await runProgressTask(12, 30, "Geocoding location...", () =>
          geocodeLocation(locationText),
        );
        setSelectedLocation(resolvedLocation);
        shouldAutofillFromLocation = true;
      }
      setGenerationProgress((prev) => Math.max(prev, 30));

      const resolvedCity =
        resolvedLocation.city || fallbackParts.city || locationText;
      const resolvedCountry = resolvedLocation.country || fallbackParts.country;

      let displayCity = form.displayCity.trim() || resolvedCity;
      let displayCountry = form.displayCountry.trim() || resolvedCountry;
      if (shouldAutofillFromLocation) {
        displayCity = resolvedCity;
        displayCountry = resolvedCountry;
      }

      const fontFamily = form.fontFamily.trim();
      const center = {
        lat: resolvedLocation.lat,
        lon: resolvedLocation.lon,
        displayName: resolvedLocation.label || locationText,
      };

      setForm((prev) => ({
        ...prev,
        location: resolvedLocation.label || locationText,
        latitude: resolvedLocation.lat.toFixed(6),
        longitude: resolvedLocation.lon.toFixed(6),
        displayCity: shouldAutofillFromLocation ? resolvedCity : prev.displayCity,
        displayCountry: shouldAutofillFromLocation
          ? resolvedCountry
          : prev.displayCountry,
      }));

      const aspectRatio = widthInches / heightInches;
      const { posterBounds, fetchBounds } = computePosterAndFetchBounds(
        center,
        distanceMeters,
        aspectRatio,
      );

      const mapData = await runProgressTask(
        35,
        72,
        "Loading OpenStreetMap features...",
        () =>
          fetchMapData(fetchBounds, {
            buildingBounds: posterBounds,
          }),
      );

      if (
        mapData.roads.length === 0 &&
        mapData.waterPolygons.length === 0 &&
        mapData.parkPolygons.length === 0 &&
        mapData.buildingPolygons.length === 0
      ) {
        throw new Error(
          "No map features were returned for this area. Try a different city or increase distance.",
        );
      }

      await runProgressTask(74, 84, "Loading typography...", () =>
        ensureGoogleFont(fontFamily),
      );

      renderCacheRef.current = {
        mapData,
        bounds: posterBounds,
        center,
        widthInches,
        heightInches,
        baseCity: resolvedCity,
        baseCountry: resolvedCountry,
        baseLocation: resolvedLocation.label || locationText,
      };

      setStatus("Rendering poster...");
      setGenerationProgress((prev) => Math.max(prev, 90));
      const size = renderWithCachedMap(selectedTheme, {
        displayCity,
        displayCountry,
        fontFamily,
      });

      if (!size) {
        throw new Error("Canvas is not available.");
      }

      setResult({
        size,
        center,
        roads: mapData.roads.length,
        water: mapData.waterPolygons.length,
        parks: mapData.parkPolygons.length,
        buildings: mapData.buildingPolygons.length,
        widthCm,
        heightCm,
        distanceMeters,
      });
      setGenerationProgress(100);
      setStatus("Poster ready.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error";
      setError(message);
      setGenerationProgress(0);
      setStatus("");
    } finally {
      setIsGenerating(false);
    }
  }

  function handleDownload() {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    canvas.toBlob((blob) => {
      if (!blob) {
        return;
      }

      const link = document.createElement("a");
      const filename = createPosterFilename(form.displayCity || form.location, form.theme);
      const url = URL.createObjectURL(blob);

      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    }, "image/png");
  }

  const showLocationSuggestions =
    isLocationFocused && (isLocationSearching || locationSuggestions.length > 0);

  return (
    <div className="app-shell">
      <AppHeader />

      <main className="app-grid">
        <SettingsPanel
          form={form}
          onSubmit={handleGenerate}
          onChange={handleChange}
          selectedTheme={selectedTheme}
          themeOptions={themeOptions}
          minPosterCm={MIN_POSTER_CM}
          maxPosterCm={MAX_POSTER_CM}
          fontOptions={FONT_OPTIONS}
          isGenerating={isGenerating}
          generationProgress={generationProgress}
          onDownload={handleDownload}
          hasResult={Boolean(result)}
          status={status}
          error={error}
          showLocationSuggestions={showLocationSuggestions}
          locationSuggestions={locationSuggestions}
          isLocationSearching={isLocationSearching}
          onLocationSelect={handleLocationSelect}
          onLocationFocus={() => setIsLocationFocused(true)}
          onLocationBlur={() => {
            window.setTimeout(() => setIsLocationFocused(false), 120);
          }}
        />

        <PreviewPanel
          canvasRef={canvasRef}
          selectedTheme={selectedTheme}
          isGenerating={isGenerating}
          status={status}
          generationProgress={generationProgress}
          result={result}
        />

        <InfoPanel
          selectedTheme={selectedTheme}
          themePalette={themePalette}
          result={result}
          repoUrl={REPO_URL}
          repoStars={repoStars}
          repoStarsLoading={repoStarsLoading}
          contactEmail={contactEmail}
          legalNoticeUrl={legalNoticeUrl}
          privacyUrl={privacyUrl}
          hasFooterLinks={hasFooterLinks}
        />
      </main>

      <FooterNote />
    </div>
  );
}
