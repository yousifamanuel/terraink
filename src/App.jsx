import { useEffect, useMemo, useRef, useState } from "react";
import { computePosterAndFetchBounds } from "./lib/geo";
import { fetchMapData, geocodeLocation, searchLocations } from "./lib/osm";
import { renderPoster } from "./lib/posterRenderer";
import { defaultThemeName, getTheme, themeOptions } from "./lib/themes";

const DEFAULT_FORM = {
  location: "Hanover, Germany",
  latitude: "",
  longitude: "",
  distance: "4000",
  width: "12",
  height: "16",
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
  const [result, setResult] = useState(null);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [isLocationSearching, setIsLocationSearching] = useState(false);
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
    const fallback = parseLocationParts(suggestion.label);
    const city = suggestion.city || fallback.city;
    const country = suggestion.country || fallback.country;

    setSelectedLocation(suggestion);
    setLocationSuggestions([]);
    setIsLocationFocused(false);
    setForm((prev) => ({
      ...prev,
      location: suggestion.label,
      latitude: suggestion.lat.toFixed(6),
      longitude: suggestion.lon.toFixed(6),
      displayCity: city,
      displayCountry: country,
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
    const renderCache = renderCacheRef.current;
    if (!renderCache) {
      return;
    }

    const typography = resolveTypography(renderCache);
    let cancelled = false;

    async function rerenderPreview() {
      await ensureGoogleFont(typography.fontFamily);
      if (cancelled) {
        return;
      }

      const size = renderWithCachedMap(selectedTheme, typography);
      if (!size) {
        return;
      }

      setResult((prev) => (prev ? { ...prev, size } : prev));
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
    setIsGenerating(true);

    try {
      const locationText = form.location.trim();
      if (!locationText) {
        throw new Error("Location is required.");
      }

      const widthInches = clamp(parseNumericInput("Width", form.width), 1, 20);
      const heightInches = clamp(
        parseNumericInput("Height", form.height),
        1,
        20,
      );
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
        setStatus("Geocoding location...");
        resolvedLocation = await geocodeLocation(locationText);
        setSelectedLocation(resolvedLocation);
        shouldAutofillFromLocation = true;
      }

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

      setStatus("Loading OpenStreetMap features...");
      const aspectRatio = widthInches / heightInches;
      const { posterBounds, fetchBounds } = computePosterAndFetchBounds(
        center,
        distanceMeters,
        aspectRatio,
      );
      const mapData = await fetchMapData(fetchBounds, {
        buildingBounds: posterBounds,
      });
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

      setStatus("Rendering poster...");
      await ensureGoogleFont(fontFamily);

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
        widthInches,
        heightInches,
        distanceMeters,
      });
      setStatus("Poster ready.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error";
      setError(message);
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
                Width (in)
                <input
                  name="width"
                  type="number"
                  min="1"
                  max="20"
                  step="0.1"
                  value={form.width}
                  onChange={handleChange}
                />
              </label>
              <label>
                Height (in)
                <input
                  name="height"
                  type="number"
                  min="1"
                  max="20"
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
              {isGenerating ? "Generating..." : "Generate Poster"}
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
          <p className="source-note">
            Sources: Nominatim, Overpass API, OpenStreetMap contributors.
          </p>
        </form>

        <section className="preview-panel">
          <div
            className="poster-viewport"
            style={{
              "--poster-bg": selectedTheme.bg,
            }}
          >
            <canvas ref={canvasRef} />
            {!result ? (
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

          <section className="inspector-card">
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
              </>
            ) : (
              <p>No render yet. Use the controls to generate a poster.</p>
            )}
          </section>
        </aside>
      </main>
    </div>
  );
}
