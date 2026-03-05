import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { usePosterContext } from "./PosterContext";
import { useMapSync } from "@/features/map/application/useMapSync";
import MapPreview from "@/features/map/ui/MapPreview";
import GradientFades from "./GradientFades";
import PosterTextOverlay from "./PosterTextOverlay";
import {
  EditIcon,
  FinishIcon,
  PlusIcon,
  MinusIcon,
  RotateIcon,
  RotateLeftIcon,
  RotateRightIcon,
  LockIcon,
  RecenterIcon,
} from "@/shared/ui/Icons";
import {
  MAP_BUTTON_ZOOM_DURATION_MS,
  MAP_BUTTON_ZOOM_STEP,
} from "@/features/map/infrastructure";
import { MAP_OVERZOOM_SCALE } from "@/features/map/infrastructure/constants";
import {
  DEFAULT_POSTER_WIDTH_CM,
  DEFAULT_POSTER_HEIGHT_CM,
  DEFAULT_DISTANCE_METERS,
  DEFAULT_LAT,
  DEFAULT_LON,
  DEFAULT_CITY,
  DEFAULT_COUNTRY,
} from "@/core/config";
import { ensureGoogleFont, reverseGeocodeCoordinates } from "@/core/services";

const LOCKED_HINT = "Map is locked to prevent unintended movement.";
const EDIT_HINT_ACTIVE =
  "Drag to move and scroll or pinch to zoom.\nUse arrow keys to move the map and +/- to zoom.";
const RECENTER_HINT = "Recenter map to the current location";
const COUNTRY_VIEW_ZOOM_LEVEL = 10;
const CONTINENT_VIEW_ZOOM_LEVEL = 6;
const DEFAULT_LOCATION_LABEL =
  "Hanover, Region Hannover, Lower Saxony, Germany";

export default function PreviewPanel() {
  const { state, dispatch, effectiveTheme, mapStyle, mapRef } = usePosterContext();
  const { form, selectedLocation, userLocation } = state;
  const {
    mapCenter,
    mapZoom,
    mapMinZoom,
    mapMaxZoom,
    handleMove,
    handleMoveEnd,
    setContainerWidth,
  } = useMapSync();

  const frameRef = useRef<HTMLDivElement | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [mapBearing, setMapBearing] = useState(0);
  const [isRotationEnabled, setIsRotationEnabled] = useState(false);

  useEffect(() => {
    const element = frameRef.current;
    if (!element) return;

    const observer = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentRect.width);
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [setContainerWidth]);

  useEffect(() => {
    const family = form.fontFamily.trim();
    if (!family) return;

    void ensureGoogleFont(family).catch(() => {
      // Ignore font loading failures; fallback stack remains in place.
    });
  }, [form.fontFamily]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const syncBearing = () => {
      setMapBearing(map.getBearing());
    };

    map.on("rotate", syncBearing);
    return () => {
      map.off("rotate", syncBearing);
    };
  }, [mapRef]);

  const widthCm = Number(form.width) || DEFAULT_POSTER_WIDTH_CM;
  const heightCm = Number(form.height) || DEFAULT_POSTER_HEIGHT_CM;
  const aspect = widthCm / heightCm;

  const formLat = Number(form.latitude) || 0;
  const formLon = Number(form.longitude) || 0;
  const isCityCountryView = mapZoom >= COUNTRY_VIEW_ZOOM_LEVEL;
  const isCountryContinentView =
    mapZoom >= CONTINENT_VIEW_ZOOM_LEVEL && mapZoom < COUNTRY_VIEW_ZOOM_LEVEL;
  const cityLabel = isCityCountryView
    ? form.displayCity || form.location || "Hanover"
    : isCountryContinentView
      ? form.displayCountry || "Germany"
      : form.displayContinent || "Earth";
  const countryLabel = isCityCountryView
    ? form.displayCountry || "Germany"
    : isCountryContinentView
      ? form.displayContinent || "Europe"
      : "Earth";

  const handleStartEditing = useCallback(() => {
    setIsEditing(true);
    const map = mapRef.current;
    if (map) {
      setMapBearing(map.getBearing());
    }
  }, [mapRef]);

  const handleFinishEditing = useCallback(() => {
    setIsEditing(false);
    setIsRotationEnabled(false);
  }, []);

  const handleToggleRotation = useCallback(() => {
    setIsRotationEnabled((prev) => !prev);
  }, []);

  const handleZoomIn = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;

    const nextZoom = Math.min(map.getZoom() + MAP_BUTTON_ZOOM_STEP, mapMaxZoom);
    if (Math.abs(nextZoom - map.getZoom()) < 0.0001) return;

    map.zoomTo(nextZoom, { duration: MAP_BUTTON_ZOOM_DURATION_MS });
  }, [mapRef, mapMaxZoom]);

  const handleZoomOut = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;

    const nextZoom = Math.max(map.getZoom() - MAP_BUTTON_ZOOM_STEP, mapMinZoom);
    if (Math.abs(nextZoom - map.getZoom()) < 0.0001) return;

    map.zoomTo(nextZoom, { duration: MAP_BUTTON_ZOOM_DURATION_MS });
  }, [mapRef, mapMinZoom]);

  const handleZoomSliderChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const map = mapRef.current;
      if (!map) return;
      const nextZoom = Number(event.target.value);
      if (!Number.isFinite(nextZoom)) return;
      map.zoomTo(nextZoom, { duration: MAP_BUTTON_ZOOM_DURATION_MS });
    },
    [mapRef],
  );

  const handleRotationSliderChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const map = mapRef.current;
      if (!map) return;
      const nextBearing = Number(event.target.value);
      if (!Number.isFinite(nextBearing)) return;
      setMapBearing(nextBearing);
      map.rotateTo(nextBearing, { duration: MAP_BUTTON_ZOOM_DURATION_MS });
    },
    [mapRef],
  );

  const handleRotateBy = useCallback(
    (deltaDeg: number) => {
      const map = mapRef.current;
      if (!map) return;
      const current = map.getBearing();
      const nextBearing = Math.max(-180, Math.min(180, current + deltaDeg));
      setMapBearing(nextBearing);
      map.rotateTo(nextBearing, { duration: MAP_BUTTON_ZOOM_DURATION_MS });
    },
    [mapRef],
  );

  const handleRecenter = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    const target =
      selectedLocation ||
      userLocation || {
        id: "fallback:hanover",
        label: DEFAULT_LOCATION_LABEL,
        city: DEFAULT_CITY,
        country: DEFAULT_COUNTRY,
        continent: "Europe",
        lat: DEFAULT_LAT,
        lon: DEFAULT_LON,
      };
    const applyTarget = (
      city: string,
      country: string,
      continent: string,
      label: string,
      includeCoordinates = true,
    ) => {
      dispatch({
        type: "SET_FORM_FIELDS",
        fields: {
          ...(includeCoordinates
            ? {
              location: label,
              latitude: target.lat.toFixed(6),
              longitude: target.lon.toFixed(6),
              distance: String(DEFAULT_DISTANCE_METERS),
            }
            : { location: label }),
          displayCity: city,
          displayCountry: country,
          displayContinent: continent,
        },
      });
    };

    const city = String(target.city ?? "").trim();
    const country = String(target.country ?? "").trim();
    const continent = String(target.continent ?? "").trim();
    const label = String(target.label ?? "").trim() || DEFAULT_LOCATION_LABEL;
    map.stop();
    map.jumpTo({
      bearing: 0,
      pitch: 0,
    });
    setMapBearing(0);

    if (city && country) {
      // All display names known — single dispatch with coordinates + correct names.
      applyTarget(city, country, continent || "Europe", label, true);
      return;
    }

    // Coordinates known but names aren't — set coordinates with fallback names
    // immediately, then overwrite names once reverse-geocoding resolves.
    applyTarget(DEFAULT_CITY, DEFAULT_COUNTRY, "Europe", label, true);

    void reverseGeocodeCoordinates(target.lat, target.lon)
      .then((resolved) => {
        dispatch({ type: "SET_USER_LOCATION", location: resolved });
        dispatch({
          type: "SET_FORM_FIELDS",
          fields: {
            displayCity: String(resolved.city ?? "").trim() || DEFAULT_CITY,
            displayCountry: String(resolved.country ?? "").trim() || DEFAULT_COUNTRY,
            displayContinent: String(resolved.continent ?? "").trim() || "Europe",
          },
        });
      })
      .catch(() => {
        // fallback names already applied above — nothing more to do.
      });
  }, [
    mapRef,
    selectedLocation,
    userLocation,
    dispatch,
  ]);

  return (
    <section className="preview-panel">
      <div className="poster-viewport">
        <div
          ref={frameRef}
          className="poster-frame"
          style={
            {
              "--poster-aspect": `${aspect}`,
              "--poster-bg": effectiveTheme.ui.bg,
            } as CSSProperties
          }
        >
          <MapPreview
            style={mapStyle}
            center={mapCenter}
            zoom={mapZoom}
            mapRef={mapRef}
            interactive={isEditing}
            allowRotation={isEditing && isRotationEnabled}
            minZoom={mapMinZoom}
            maxZoom={mapMaxZoom}
            overzoomScale={MAP_OVERZOOM_SCALE}
            onMove={handleMove}
            onMoveEnd={handleMoveEnd}
            showMarker={form.showMarker}
            markerCenter={[formLon, formLat]}
            markerColor={form.markerColor || effectiveTheme.ui.text}
            markerStyle={form.markerStyle}
            markerSize={form.markerSize}
          />
          <GradientFades color={effectiveTheme.ui.bg} />
          <PosterTextOverlay
            city={cityLabel}
            country={countryLabel}
            lat={formLat}
            lon={formLon}
            fontFamily={form.fontFamily}
            textColor={effectiveTheme.ui.text}
            showPosterText={form.showPosterText}
            includeCredits={form.includeCredits}
          />
        </div>
      </div>

      <section className="map-controls-section" aria-label="Map controls">
        <div className="map-controls">
          {!isEditing ? (
            <>
              <div className="map-control-group">
                <button
                  type="button"
                  className="map-control-btn"
                  onClick={handleRecenter}
                  title={RECENTER_HINT}
                >
                  <RecenterIcon />
                  <span>Recenter</span>
                </button>
                <button
                  type="button"
                  className="map-control-btn map-control-btn--primary"
                  onClick={handleStartEditing}
                  title="Unlock map editing"
                >
                  <EditIcon />
                  <span>Edit Map</span>
                </button>
              </div>
              <p className="map-control-hint">
                <LockIcon className="map-control-hint-icon" />
                {LOCKED_HINT}
              </p>
            </>
          ) : (
            <>
              <div className="map-control-group">
                <button
                  type="button"
                  className="map-control-btn"
                  onClick={handleRecenter}
                  title={RECENTER_HINT}
                >
                  <RecenterIcon />
                  <span>Recenter</span>
                </button>
                <button
                  type="button"
                  className="map-control-btn map-control-btn--primary"
                  onClick={handleFinishEditing}
                  title="Lock map editing"
                >
                  <FinishIcon />
                  <span>Finish</span>
                </button>
                <button
                  type="button"
                  className={`map-control-btn${isRotationEnabled ? " is-active" : ""}`}
                  onClick={handleToggleRotation}
                  title={isRotationEnabled ? "Disable rotation" : "Enable rotation"}
                >
                  <RotateIcon />
                  <span>{isRotationEnabled ? "Disable Rotation" : "Enable Rotation"}</span>
                </button>
              </div>
              <p className="map-control-hint">
                {EDIT_HINT_ACTIVE}
              </p>
              <div className="map-control-group map-control-slider-row">
                <button
                  type="button"
                  className="map-control-btn"
                  onClick={handleZoomOut}
                  title="Zoom out"
                >
                  <MinusIcon />
                </button>
                <input
                  className="map-control-slider"
                  type="range"
                  min={mapMinZoom}
                  max={mapMaxZoom}
                  step={0.1}
                  value={mapZoom}
                  onChange={handleZoomSliderChange}
                  aria-label="Zoom level"
                />
                <button
                  type="button"
                  className="map-control-btn"
                  onClick={handleZoomIn}
                  title="Zoom in"
                >
                  <PlusIcon />
                </button>
              </div>
              {isRotationEnabled ? (
                <div className="map-control-group map-control-slider-row">
                  <button
                    type="button"
                    className="map-control-btn"
                    onClick={() => handleRotateBy(-15)}
                    title="Rotate left 15 degrees"
                  >
                    <RotateLeftIcon />
                  </button>
                  <input
                    className="map-control-slider"
                    type="range"
                    min={-180}
                    max={180}
                    step={15}
                    value={Math.round(mapBearing / 15) * 15}
                    onChange={handleRotationSliderChange}
                    aria-label="Rotation angle"
                  />
                  <button
                    type="button"
                    className="map-control-btn"
                    onClick={() => handleRotateBy(15)}
                    title="Rotate right 15 degrees"
                  >
                    <RotateRightIcon />
                  </button>
                </div>
              ) : null}
            </>
          )}
        </div>
      </section>
    </section>
  );
}
