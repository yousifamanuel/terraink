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
import MarkerOverlay from "@/features/markers/ui/MarkerOverlay";
import RouteOverlay from "@/features/routes/ui/RouteOverlay";
import RouteEndpointsOverlay from "@/features/routes/ui/RouteEndpointsOverlay";
import GradientFades from "./GradientFades";
import PosterTextOverlay from "./PosterTextOverlay";
import SettingsInfo from "./SettingsInfo";
import MapPrimaryControls from "./MapPrimaryControls";
import {
  PlusIcon,
  MinusIcon,
  RotateIcon,
  RotateLeftIcon,
  RotateRightIcon,
} from "@/shared/ui/Icons";
import {
  MAP_BUTTON_ZOOM_DURATION_MS,
  MAP_BUTTON_ZOOM_STEP,
} from "@/features/map/infrastructure";
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
import {
  createCustomLayoutOption,
  formatLayoutDimensions,
  getLayoutOption,
} from "@/features/layout/infrastructure/layoutRepository";

const LOCKED_HINT = "Map is locked to prevent unintended movement.";
const UNLOCK_HINT = `${LOCKED_HINT}\nClick to unlock map editing.`;
const RECENTER_HINT = "Recenter map to the current location";
const COUNTRY_VIEW_ZOOM_LEVEL = 10;
const CONTINENT_VIEW_ZOOM_LEVEL = 6;
const DEFAULT_LOCATION_LABEL =
  "Hanover, Region Hannover, Lower Saxony, Germany";

export default function PreviewPanel() {
  const { state, dispatch, effectiveTheme, mapStyle, mapRef } =
    usePosterContext();
  const {
    form,
    selectedLocation,
    userLocation,
    isMarkerEditorActive,
    activeMarkerId,
  } = state;
  const hasVisibleMarkers = form.showMarkers && state.markers.length > 0;
  const {
    mapCenter,
    mapZoom,
    mapMinZoom,
    mapMaxZoom,
    handleMove,
    handleMoveEnd,
    setContainerWidth,
    overzoomScale,
  } = useMapSync(state, dispatch, mapRef);

  const frameRef = useRef<HTMLDivElement | null>(null);
  const ghostCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [mapBearing, setMapBearing] = useState(0);
  const [isRotationEnabled, setIsRotationEnabled] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia(
      "(max-width: 768px), (hover: none) and (pointer: coarse)",
    );
    const syncViewport = () => setIsMobileViewport(mediaQuery.matches);
    syncViewport();
    mediaQuery.addEventListener("change", syncViewport);

    return () => {
      mediaQuery.removeEventListener("change", syncViewport);
    };
  }, []);

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
    const map = mapRef.current;
    if (!map) return;

    const syncGhostCanvas = () => {
      const ghost = ghostCanvasRef.current;
      if (!ghost) return;
      const src = map.getCanvas();
      if (!src) return;

      if (ghost.width !== src.width || ghost.height !== src.height) {
        ghost.width = src.width;
        ghost.height = src.height;
      }

      const ctx = ghost.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(src, 0, 0);
    };

    map.on("render", syncGhostCanvas);
    return () => {
      map.off("render", syncGhostCanvas);
    };
  }, [mapRef]);

  useEffect(() => {
    if (!isMarkerEditorActive) {
      return;
    }
    setIsEditing(false);
    setIsRotationEnabled(false);
  }, [isMarkerEditorActive]);

  const widthCm = Number(form.width) || DEFAULT_POSTER_WIDTH_CM;
  const heightCm = Number(form.height) || DEFAULT_POSTER_HEIGHT_CM;
  const aspect = widthCm / heightCm;
  const formLat = Number(form.latitude) || 0;
  const formLon = Number(form.longitude) || 0;
  const layoutOption =
    getLayoutOption(form.layout) ?? createCustomLayoutOption(widthCm, heightCm);
  const posterSizeLabel = formatLayoutDimensions(layoutOption);
  const layoutLabel = `${layoutOption.name} (${formatLayoutDimensions(layoutOption)})`;
  const infoLocationLabel =
    [form.displayCity, form.displayCountry].filter(Boolean).join(", ") ||
    form.location ||
    DEFAULT_LOCATION_LABEL;
  const infoLayoutLabel = layoutOption.name;
  const markerCount = state.markers.length;
  const markersLabel = `${markerCount} marker${markerCount === 1 ? "" : "s"}`;
  const coordinatesLabel = `${formLat.toFixed(4)}, ${formLon.toFixed(4)}`;
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
    const target = selectedLocation ||
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
            displayCountry:
              String(resolved.country ?? "").trim() || DEFAULT_COUNTRY,
            displayContinent:
              String(resolved.continent ?? "").trim() || "Europe",
          },
        });
      })
      .catch(() => {
        // fallback names already applied above — nothing more to do.
      });
  }, [mapRef, selectedLocation, userLocation, dispatch]);

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

  const handleMarkerActiveChange = useCallback(
    (markerId: string | null) => {
      dispatch({ type: "SET_ACTIVE_MARKER", markerId });
    },
    [dispatch],
  );

  const handleMarkerSizeChange = useCallback(
    (markerId: string, size: number) => {
      dispatch({
        type: "UPDATE_MARKER",
        markerId,
        changes: { size },
      });
    },
    [dispatch],
  );

  return (
    <section className="preview-panel">
      <div className="poster-viewport">
        {/* Desktop ghost layer: canvas clone of the main map at reduced opacity */}
        <div className="poster-ghost-layer" aria-hidden="true">
          <canvas
            ref={ghostCanvasRef}
            className="poster-ghost-canvas"
          />
        </div>
        <div className="desktop-layout-label" aria-hidden="true">
          {layoutLabel}
        </div>
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
            overzoomScale={overzoomScale}
            onMove={handleMove}
            onMoveEnd={handleMoveEnd}
          />
          {form.showMarkers ? (
            <GradientFades color={effectiveTheme.ui.bg} />
          ) : null}
          <RouteOverlay
            routes={state.routes}
            mapRef={mapRef}
            visible={form.showRoutes}
            overzoomScale={overzoomScale}
          />
          <RouteEndpointsOverlay
            routes={state.routes}
            customIcons={state.customMarkerIcons}
            mapRef={mapRef}
            visible={form.showRoutes}
            overzoomScale={overzoomScale}
          />
          {hasVisibleMarkers ? (
            <MarkerOverlay
              markers={state.markers}
              customIcons={state.customMarkerIcons}
              mapRef={mapRef}
              isMarkerEditMode={isMarkerEditorActive}
              activeMarkerId={activeMarkerId}
              onActiveMarkerChange={handleMarkerActiveChange}
              onMarkerPositionChange={handleMarkerPositionChange}
              onMarkerSizeChange={handleMarkerSizeChange}
              overzoomScale={overzoomScale}
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

          <div className="map-controls" aria-label="Map controls">
            {!isEditing ? (
              <>
                <div className="map-control-group">
                  <MapPrimaryControls
                    isMapEditing={false}
                    isMarkerEditorActive={isMarkerEditorActive}
                    recenterHint={RECENTER_HINT}
                    unlockHint={UNLOCK_HINT}
                    onRecenter={handleRecenter}
                    onStartEditing={handleStartEditing}
                    onFinishEditing={handleFinishEditing}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="map-control-group">
                  <MapPrimaryControls
                    isMapEditing
                    isMarkerEditorActive={isMarkerEditorActive}
                    recenterHint={RECENTER_HINT}
                    unlockHint={UNLOCK_HINT}
                    onRecenter={handleRecenter}
                    onStartEditing={handleStartEditing}
                    onFinishEditing={handleFinishEditing}
                  />
                  {isMobileViewport ? (
                    <button
                      type="button"
                      className={`map-control-btn${isRotationEnabled ? " is-active" : ""}`}
                      onClick={handleToggleRotation}
                      title={
                        isRotationEnabled
                          ? "Disable rotation"
                          : "Enable rotation"
                      }
                    >
                      <RotateIcon />
                      <span>
                        {isRotationEnabled
                          ? "Disable Rotation"
                          : "Enable Rotation"}
                      </span>
                    </button>
                  ) : null}
                </div>
                {!isMobileViewport ? (
                  <div className="map-control-group">
                    <button
                      type="button"
                      className={`map-control-btn${isRotationEnabled ? " is-active" : ""}`}
                      onClick={handleToggleRotation}
                      title={
                        isRotationEnabled
                          ? "Disable rotation"
                          : "Enable rotation"
                      }
                    >
                      <RotateIcon />
                      <span>
                        {isRotationEnabled
                          ? "Disable Rotation"
                          : "Enable Rotation"}
                      </span>
                    </button>
                  </div>
                ) : null}
                {!isMobileViewport ? (
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
                ) : null}
                {!isMobileViewport && isRotationEnabled ? (
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
        </div>
      </div>

      <SettingsInfo
        location={infoLocationLabel}
        theme={effectiveTheme.name}
        layout={infoLayoutLabel}
        posterSize={posterSizeLabel}
        markers={markersLabel}
        coordinates={coordinatesLabel}
      />
    </section>
  );
}
