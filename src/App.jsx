import { useEffect, useMemo, useRef, useState } from "react";
import { computePosterAndFetchBounds } from "./lib/geo";
import { fetchMapData, geocodeLocation, searchLocations } from "./lib/osm";
import { renderPoster } from "./lib/posterRenderer";
import { defaultThemeName, getTheme, themeOptions } from "./lib/themes";

const CM_PER_INCH = 2.54;
const DEFAULT_POSTER_WIDTH_CM = 20;
const DEFAULT_POSTER_HEIGHT_CM = 30;
const MIN_POSTER_CM = 5;
const MAX_POSTER_CM = 60;
const REPO_URL = import.meta.env.VITE_REPO_URL;
const REPO_API_URL = import.meta.env.VITE_REPO_API_URL;
const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL;
const IMPRINT_URL = import.meta.env.VITE_LEGAL_NOTICE_URL;
const PRIVACY_URL = import.meta.env.VITE_PRIVACY_URL;

const DEFAULT_FORM = {
  location: "Hanover, Germany",
  latitude: "",
  longitude: "",
  distance: "4000",
  width: String(DEFAULT_POSTER_WIDTH_CM),
  height: String(DEFAULT_POSTER_HEIGHT_CM),
  theme: defaultThemeName,
  displayCity: "",
  displayCountry: "",
  fontFamily: "",
};

const FONT_OPTIONS = [
  { value: "", label: "Default (Space Grotesk)" },
  { value: "Montserrat", label: "Montserrat" },
  { value: "Playfair Display", label: "Playfair Display" },
  { value: "Oswald", label: "Oswald" },
  { value: "Noto Sans JP", label: "Noto Sans JP" },
  { value: "Source Sans Pro", label: "Source Sans Pro" },
  { value: "Raleway", label: "Raleway" },
  { value: "Lato", label: "Lato" },
  { value: "Merriweather", label: "Merriweather" },
  { value: "bebas neue", label: "Bebas Neue" },
];

function parseLocationParts(value) {
  const parts = String(value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (parts.length === 0) {
    return { city: "", country: "" };
  }

  if (parts.length === 1) {
    return { city: parts[0], country: "" };
  }

  return {
    city: parts[0],
    country: parts[parts.length - 1],
  };
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function parseNumericInput(label, value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new Error(`${label} must be a valid number`);
  }
  return parsed;
}

function slugifyCity(value) {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return normalized || "city";
}

function createTimestamp() {
  const date = new Date();
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}${month}${day}_${hours}${minutes}${seconds}`;
}

async function ensureGoogleFont(fontFamily) {
  const family = fontFamily.trim();
  if (!family) {
    return;
  }

  const linkId = `font-${family.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  if (!document.getElementById(linkId)) {
    const link = document.createElement("link");
    link.id = linkId;
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
      family,
    ).replace(/%20/g, "+")}:wght@300;400;700&display=swap`;
    document.head.appendChild(link);
  }

  if (document.fonts?.load) {
    await Promise.allSettled([
      document.fonts.load(`300 16px "${family}"`),
      document.fonts.load(`400 16px "${family}"`),
      document.fonts.load(`700 16px "${family}"`),
    ]);
  }
}

export default function App() {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [isLocationSearching, setIsLocationSearching] = useState(false);
  const [isLocationFocused, setIsLocationFocused] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [repoStars, setRepoStars] = useState(null);
  const [repoStarsLoading, setRepoStarsLoading] = useState(true);
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
  const contactEmail = String(CONTACT_EMAIL ?? "").trim();
  const imprintUrl = String(IMPRINT_URL ?? "").trim();
  const privacyUrl = String(PRIVACY_URL ?? "").trim();
  const hasFooterLinks = Boolean(contactEmail || imprintUrl || privacyUrl);

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
    setLocationSuggestions([]);
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
    const query = form.location.trim();
    if (!isLocationFocused || query.length < 2) {
      setLocationSuggestions([]);
      setIsLocationSearching(false);
      return;
    }

    let cancelled = false;
    const debounceId = window.setTimeout(async () => {
      setIsLocationSearching(true);
      try {
        const suggestions = await searchLocations(query, 6);
        if (!cancelled) {
          setLocationSuggestions(suggestions);
        }
      } catch {
        if (!cancelled) {
          setLocationSuggestions([]);
        }
      } finally {
        if (!cancelled) {
          setIsLocationSearching(false);
        }
      }
    }, 220);

    return () => {
      cancelled = true;
      window.clearTimeout(debounceId);
    };
  }, [form.location, isLocationFocused]);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    async function fetchRepoStars() {
      try {
        setRepoStarsLoading(true);
        const response = await fetch(REPO_API_URL, {
          headers: {
            Accept: "application/vnd.github+json",
          },
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`GitHub API failed with HTTP ${response.status}`);
        }

        const payload = await response.json();
        const stars = Number(payload?.stargazers_count);
        if (!cancelled && Number.isFinite(stars) && stars >= 0) {
          setRepoStars(stars);
        }
      } catch {
        if (!cancelled) {
          setRepoStars(null);
        }
      } finally {
        if (!cancelled) {
          setRepoStarsLoading(false);
        }
      }
    }

    fetchRepoStars();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  useEffect(() => {
    const renderCache = renderCacheRef.current;
    if (!renderCache) {
      return;
    }

    const typography = resolveTypography(renderCache);
    let cancelled = false;

    async function rerenderPreview() {
      // Repaint immediately for responsive controls.
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
        resolvedLocation = await runProgressTask(
          12,
          30,
          "Geocoding location...",
          () => geocodeLocation(locationText),
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
        displayCity: shouldAutofillFromLocation
          ? resolvedCity
          : prev.displayCity,
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
      const citySlug = slugifyCity(form.displayCity || form.location);
      const filename = `${citySlug}_${form.theme}_${createTimestamp()}.png`;
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    }, "image/png");
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand-row">
          <div className="brand-copy">
            <p className="app-kicker">
              TerraInk: The Cartographic Poster Engine
            </p>
            <h1>TerraInk</h1>
            <p className="app-copy">
              Build high-detail map posters from OpenStreetMap data with curated
              palettes, custom typography, and print-ready PNG output.
            </p>
          </div>
          <img
            className="brand-logo"
            src="/assets/logo.svg"
            alt="TerraInk logo"
          />
        </div>
      </header>

      <main className="app-grid">
        <form className="settings-panel" onSubmit={handleGenerate}>
          <section className="panel-block">
            <h2>Location</h2>
            <label>
              Location
              <div className="location-autocomplete">
                <input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  onFocus={() => setIsLocationFocused(true)}
                  onBlur={() => {
                    window.setTimeout(() => setIsLocationFocused(false), 120);
                  }}
                  placeholder="Start typing a city or place"
                  autoComplete="off"
                  required
                />
                {isLocationFocused &&
                (isLocationSearching || locationSuggestions.length > 0) ? (
                  <ul className="location-suggestions" role="listbox">
                    {locationSuggestions.map((suggestion) => (
                      <li key={suggestion.id}>
                        <button
                          type="button"
                          className="location-suggestion"
                          onMouseDown={(event) => {
                            event.preventDefault();
                            handleLocationSelect(suggestion);
                          }}
                        >
                          {suggestion.label}
                        </button>
                      </li>
                    ))}
                    {isLocationSearching ? (
                      <li className="location-suggestion-status">
                        Searching...
                      </li>
                    ) : null}
                  </ul>
                ) : null}
              </div>
            </label>
            <div className="field-grid">
              <label>
                Latitude (optional)
                <input
                  name="latitude"
                  value={form.latitude}
                  onChange={handleChange}
                  placeholder="48.8566"
                />
              </label>
              <label>
                Longitude (optional)
                <input
                  name="longitude"
                  value={form.longitude}
                  onChange={handleChange}
                  placeholder="2.3522"
                />
              </label>
            </div>
          </section>

          <section className="panel-block">
            <h2>Map Settings</h2>
            <label>
              Theme
              <select name="theme" value={form.theme} onChange={handleChange}>
                {themeOptions.map((themeOption) => (
                  <option key={themeOption.id} value={themeOption.id}>
                    {themeOption.name}
                  </option>
                ))}
              </select>
            </label>
            <p className="theme-note">{selectedTheme.description}</p>
            <div className="field-grid triple">
              <label>
                Distance (m)
                <input
                  name="distance"
                  type="number"
                  min="1000"
                  max="50000"
                  value={form.distance}
                  onChange={handleChange}
                />
              </label>
              <label>
                Width (cm)
                <input
                  name="width"
                  type="number"
                  min={MIN_POSTER_CM}
                  max={MAX_POSTER_CM}
                  step="0.1"
                  value={form.width}
                  onChange={handleChange}
                />
              </label>
              <label>
                Height (cm)
                <input
                  name="height"
                  type="number"
                  min={MIN_POSTER_CM}
                  max={MAX_POSTER_CM}
                  step="0.1"
                  value={form.height}
                  onChange={handleChange}
                />
              </label>
            </div>
          </section>

          <section className="panel-block">
            <h2>Typography</h2>
            <div className="field-grid">
              <label>
                Display city
                <input
                  name="displayCity"
                  value={form.displayCity}
                  onChange={handleChange}
                  placeholder="Tokyo"
                />
              </label>
              <label>
                Display country
                <input
                  name="displayCountry"
                  value={form.displayCountry}
                  onChange={handleChange}
                  placeholder="Japan"
                />
              </label>
            </div>
            <label>
              Font
              <select
                name="fontFamily"
                value={form.fontFamily}
                onChange={handleChange}
              >
                {FONT_OPTIONS.map((fontOption) => (
                  <option
                    key={fontOption.value || "default"}
                    value={fontOption.value}
                  >
                    {fontOption.label}
                  </option>
                ))}
              </select>
            </label>
          </section>

          <div className="action-row">
            <button type="submit" disabled={isGenerating}>
              {isGenerating
                ? `Generating... ${generationProgress}%`
                : "Generate Poster"}
            </button>
            <button
              type="button"
              className="ghost"
              onClick={handleDownload}
              disabled={!result}
            >
              Download PNG
            </button>
          </div>

          {status ? <p className="status">{status}</p> : null}
          {error ? <p className="error">{error}</p> : null}
        </form>

        <section className="preview-panel">
          <div
            className="poster-viewport"
            style={{
              "--poster-bg": selectedTheme.bg,
            }}
          >
            <canvas ref={canvasRef} />
            {isGenerating ? (
              <div className="preview-loading" role="status" aria-live="polite">
                <p className="loading-title">
                  {status || "Generating poster..."}
                </p>
                <div
                  className="loading-track"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={generationProgress}
                >
                  <span
                    className="loading-fill"
                    style={{ width: `${generationProgress}%` }}
                  />
                </div>
                <p className="loading-meta">{generationProgress}% complete</p>
              </div>
            ) : !result ? (
              <div className="preview-placeholder">
                Generate a poster to see the preview.
              </div>
            ) : null}
          </div>
        </section>

        <aside className="info-panel">
          <section className="inspector-card">
            <h3>Theme Palette</h3>
            <div className="swatch-row">
              {themePalette.map((color, index) => (
                <span
                  key={`${color}-${index}`}
                  className="swatch"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
            <p className="inspector-copy">{selectedTheme.description}</p>
          </section>

          <div className="info-panel-group">
            <section className="info-panel-section">
              <h3>Render Stats</h3>
              {result ? (
                <>
                  <p>
                    Center: {result.center.lat.toFixed(5)},{" "}
                    {result.center.lon.toFixed(5)}
                  </p>
                  <p>
                    Layers: {result.roads} roads, {result.water} water,{" "}
                    {result.parks} parks, {result.buildings} buildings
                  </p>
                  <p>
                    Output: {result.size.width}x{result.size.height}px
                    {result.size.downscaleFactor < 1 ? " (downscaled)" : ""}
                  </p>
                  <p>
                    Print size: {result.widthCm.toFixed(1)}x
                    {result.heightCm.toFixed(1)} cm
                  </p>
                </>
              ) : (
                <p>No render yet. Use the controls to generate a poster.</p>
              )}
            </section>

            <section className="info-panel-section">
              <h3>Repository</h3>
              <div className="repo-actions">
                <a
                  className="github-badge"
                  href={REPO_URL}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Open TerraInk repository on GitHub"
                >
                  <svg
                    className="badge-icon"
                    viewBox="0 0 16 16"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <path
                      fill="currentColor"
                      d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.5-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.7 7.7 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"
                    />
                  </svg>
                  <span>GitHub Repo</span>
                </a>
                <a
                  className="github-badge stars-badge"
                  href={`${REPO_URL}/stargazers`}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="View TerraInk stargazers on GitHub"
                >
                  <svg
                    className="badge-icon"
                    viewBox="0 0 16 16"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <path
                      fill="currentColor"
                      d="M8 .2 10.06 5l5.2.42-3.95 3.4 1.18 5.05L8 11.2 3.51 13.87l1.18-5.05L.74 5.42 5.94 5 8 .2z"
                    />
                  </svg>
                  <span>
                    {repoStarsLoading
                      ? "Loading stars..."
                      : repoStars === null
                        ? "Stars unavailable"
                        : `${repoStars.toLocaleString()} stars`}
                  </span>
                </a>
              </div>
            </section>

            <section className="info-panel-section">
              <h3>Contact & Legal</h3>
              <section
                className="footer-links"
                aria-label="Contact and legal links"
              >
                {contactEmail ? (
                  <a className="footer-link" href={`mailto:${contactEmail}`}>
                    Contact: {contactEmail}
                  </a>
                ) : null}
                {imprintUrl ? (
                  <a
                    className="footer-link"
                    href={imprintUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Imprint
                  </a>
                ) : null}
                {privacyUrl ? (
                  <a
                    className="footer-link"
                    href={privacyUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Data Privacy
                  </a>
                ) : null}
                {!hasFooterLinks ? (
                  <p className="footer-links-note">
                    Set VITE_CONTACT_EMAIL, VITE_LEGAL_NOTICE_URL, and
                    VITE_PRIVACY_URL in your environment to show contact and
                    legal links.
                  </p>
                ) : null}
              </section>
            </section>
          </div>
        </aside>
      </main>

      <footer className="app-footer">
        <p className="source-note">
          Map search and cartographic data are powered by{" "}
          <a
            className="source-link"
            href="https://nominatim.openstreetmap.org/"
            target="_blank"
            rel="noreferrer"
          >
            Nominatim
          </a>
          ,{" "}
          <a
            className="source-link"
            href="https://overpass-api.de/"
            target="_blank"
            rel="noreferrer"
          >
            Overpass API
          </a>
          , and{" "}
          <a
            className="source-link"
            href="https://www.openstreetmap.org"
            target="_blank"
            rel="noreferrer"
          >
            OpenStreetMap contributors
          </a>
          .
        </p>
        <p className="made-note">
          Made with <span className="heart">♥</span> in Hannover, Germany
        </p>
      </footer>
    </div>
  );
}
