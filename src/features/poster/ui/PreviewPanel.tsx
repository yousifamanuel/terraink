import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { usePosterContext } from "./PosterContext";
import { useMapSync } from "@/features/map/application/useMapSync";
import MapPreview from "@/features/map/ui/MapPreview";
import MarkerOverlay from "@/features/markers/ui/MarkerOverlay";
import MarkerVisual from "@/features/markers/ui/MarkerVisual";
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
  ChevronDownIcon,
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
import { findMarkerIcon } from "@/features/markers/infrastructure/iconRegistry";

const LOCKED_HINT = "Map is locked to prevent unintended movement.";
const EDIT_HINT_ACTIVE =
  "Drag to move and scroll or pinch to zoom.\nUse arrow keys to move the map and +/- to zoom.";
const RECENTER_HINT = "Recenter map to the current location";
const COUNTRY_VIEW_ZOOM_LEVEL = 10;
const CONTINENT_VIEW_ZOOM_LEVEL = 6;
const DEFAULT_LOCATION_LABEL =
  "Hanover, Region Hannover, Lower Saxony, Germany";

interface RecenterMarkerTarget {
  id: string;
  name: string;
  lat: number;
  lon: number;
  color: string;
  iconId: string;
}

export default function PreviewPanel() {
  const { state, dispatch, effectiveTheme, mapStyle, mapRef } = usePosterContext();
  const { form, selectedLocation, userLocation } = state;
  const hasVisibleMarkers = form.showMarkers && state.markers.length > 0;
  const isMarkerEditorActive = state.isMarkerEditorActive;
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
  const recenterControlRef = useRef<HTMLDivElement | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [mapBearing, setMapBearing] = useState(0);
  const [isRotationEnabled, setIsRotationEnabled] = useState(false);
  const [isRecenterMenuOpen, setIsRecenterMenuOpen] = useState(false);

  const markerTargets = useMemo<RecenterMarkerTarget[]>(
    () =>
      state.markers.map((marker, index) => ({
        id: marker.id,
        name: `Marker ${index + 1}`,
        lat: marker.lat,
        lon: marker.lon,
        color: marker.color,
        iconId: marker.iconId,
      })),
    [state.markers],
  );

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

  useEffect(() => {
    if (!isMarkerEditorActive) {
      return;
    }
    setIsEditing(false);
    setIsRotationEnabled(false);
  }, [isMarkerEditorActive]);

  useEffect(() => {
    if (markerTargets.length > 0) {
      return;
    }
    setIsRecenterMenuOpen(false);
  }, [markerTargets.length]);

  useEffect(() => {
    setIsRecenterMenuOpen(false);
  }, [isEditing, isMarkerEditorActive]);

  useEffect(() => {
    if (!isRecenterMenuOpen) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const targetNode = event.target;
      if (!(targetNode instanceof Node)) return;
      if (recenterControlRef.current?.contains(targetNode)) return;
      setIsRecenterMenuOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setIsRecenterMenuOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isRecenterMenuOpen]);

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
        resetDisplayNameOverrides: true,
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
          resetDisplayNameOverrides: true,
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

  const toggleRecenterMenu = useCallback(() => {
    if (markerTargets.length === 0) return;
    setIsRecenterMenuOpen((current) => !current);
  }, [markerTargets.length]);

  const handleRecenterToMarker = useCallback(
    (marker: RecenterMarkerTarget) => {
      const map = mapRef.current;
      if (!map) return;
      map.easeTo({
        center: [marker.lon, marker.lat],
        duration: MAP_BUTTON_ZOOM_DURATION_MS,
      });
      setIsRecenterMenuOpen(false);
    },
    [mapRef],
  );

  const renderRecenterSplitButton = () => (
    <div
      className="map-control-split"
      ref={recenterControlRef}
    >
      <button
        type="button"
        className="map-control-btn map-control-btn--split-main"
        onClick={handleRecenter}
        title={RECENTER_HINT}
      >
        <RecenterIcon />
        <span>Recenter</span>
      </button>
      <button
        type="button"
        className="map-control-btn map-control-btn--split-toggle"
        onClick={toggleRecenterMenu}
        aria-haspopup="menu"
        aria-expanded={isRecenterMenuOpen}
        aria-label="Show marker recenter options"
        disabled={markerTargets.length === 0}
      >
        <ChevronDownIcon />
      </button>
      {isRecenterMenuOpen ? (
        <div className="map-control-dropdown" role="menu" aria-label="Marker recenter options">
          {markerTargets.map((marker) => {
            const markerIcon = findMarkerIcon(marker.iconId, state.customMarkerIcons);
            return (
              <button
                key={marker.id}
                type="button"
                className="map-control-dropdown-item"
                role="menuitem"
                onClick={() => handleRecenterToMarker(marker)}
              >
                {markerIcon ? (
                  <MarkerVisual
                    icon={markerIcon}
                    size={16}
                    color={marker.color}
                    className="map-control-dropdown-item-icon"
                  />
                ) : (
                  <span className="map-control-dropdown-item-icon map-control-dropdown-item-icon--fallback" aria-hidden="true">
                    <RecenterIcon />
                  </span>
                )}
                <span>{marker.name}</span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );

  const handleMarkerPositionChange = useCallback(
    (markerId: string, lat: number, lon: number) => {
      dispatch({
        type: "UPDATE_MARKER",
        markerId,
        changes: { lat, lon },
      });
    },
    [dispatch],
  );

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
            interactive={isEditing && !isMarkerEditorActive}
            allowRotation={isEditing && isRotationEnabled}
            minZoom={mapMinZoom}
            maxZoom={mapMaxZoom}
            overzoomScale={MAP_OVERZOOM_SCALE}
            onMove={handleMove}
            onMoveEnd={handleMoveEnd}
          />
          {form.showMarkers ? <GradientFades color={effectiveTheme.ui.bg} /> : null}
          {hasVisibleMarkers ? (
            <MarkerOverlay
              markers={state.markers}
              customIcons={state.customMarkerIcons}
              mapRef={mapRef}
              isMarkerEditMode={isMarkerEditorActive}
              onMarkerPositionChange={handleMarkerPositionChange}
            />
          ) : null}
          <PosterTextOverlay
            city={cityLabel}
            country={countryLabel}
            lat={formLat}
            lon={formLon}
            fontFamily={form.fontFamily}
            textColor={effectiveTheme.ui.text}
            landColor={effectiveTheme.map.land}
            showPosterText={form.showPosterText}
            includeCredits={form.includeCredits}
            showOverlay={form.showMarkers}
          />
        </div>
      </div>

      <section className="map-controls-section" aria-label="Map controls">
        <div className="map-controls">
          {!isEditing ? (
            <>
              <div className="map-control-group">
                {renderRecenterSplitButton()}
                <button
                  type="button"
                  className="map-control-btn map-control-btn--primary"
                  onClick={handleStartEditing}
                  title={
                    isMarkerEditorActive
                      ? "Close marker editor to unlock map editing"
                      : "Unlock map editing"
                  }
                  disabled={isMarkerEditorActive}
                >
                  <EditIcon />
                  <span>Edit Map</span>
                </button>
              </div>
              <p className="map-control-hint">
                <LockIcon className="map-control-hint-icon" />
                {isMarkerEditorActive
                  ? "Map editing is disabled while marker editor is open."
                  : LOCKED_HINT}
              </p>
            </>
          ) : (
            <>
              <div className="map-control-group">
                {renderRecenterSplitButton()}
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
