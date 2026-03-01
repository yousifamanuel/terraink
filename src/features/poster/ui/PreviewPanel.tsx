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
  MoveIcon,
  PlusIcon,
  MinusIcon,
  LockIcon,
  RecenterIcon,
} from "@/shared/ui/Icons";
import {
  MAP_BUTTON_ZOOM_DURATION_MS,
  MAP_BUTTON_ZOOM_STEP,
} from "@/features/map/infrastructure";
import {
  DEFAULT_POSTER_WIDTH_CM,
  DEFAULT_POSTER_HEIGHT_CM,
} from "@/core/config";
import { ensureGoogleFont } from "@/core/services";

const LOCKED_HINT = "Map is locked to prevent unintended movement.";
const EDIT_HINT_ACTIVE =
  "Drag to move and scroll or pinch to zoom.\nYou can also use +/- buttons or keyboard (+/- and arrow keys).";
const EDIT_HINT_MOVE_OFF =
  "Move mode is off. Enable the move button to drag/scroll, or use +/- buttons and keyboard (+/- and arrow keys).";
const RECENTER_HINT = "Recenter map to the current location";

export default function PreviewPanel() {
  const { state, effectiveTheme, mapStyle, mapRef } = usePosterContext();
  const { form, selectedLocation } = state;
  const {
    mapCenter,
    mapZoom,
    mapMinZoom,
    mapMaxZoom,
    handleMoveEnd,
    setContainerWidth,
  } = useMapSync();

  const frameRef = useRef<HTMLDivElement | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isMoveMode, setIsMoveMode] = useState(false);

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

  const widthCm = Number(form.width) || DEFAULT_POSTER_WIDTH_CM;
  const heightCm = Number(form.height) || DEFAULT_POSTER_HEIGHT_CM;
  const aspect = widthCm / heightCm;

  const formLat = Number(form.latitude) || 0;
  const formLon = Number(form.longitude) || 0;

  const handleStartEditing = useCallback(() => {
    setIsEditing(true);
    setIsMoveMode(true);
  }, []);

  const handleFinishEditing = useCallback(() => {
    setIsEditing(false);
    setIsMoveMode(false);
  }, []);

  const handleToggleMoveMode = useCallback(() => {
    setIsMoveMode((prev) => !prev);
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

  const handleRecenter = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;

    map.easeTo({
      center: selectedLocation
        ? [selectedLocation.lon, selectedLocation.lat]
        : mapCenter,
      zoom: mapZoom,
      duration: MAP_BUTTON_ZOOM_DURATION_MS,
    });
  }, [mapRef, mapCenter, mapZoom, selectedLocation]);

  return (
    <section className="preview-panel">
      <div className="poster-viewport">
        <div
          ref={frameRef}
          className="poster-frame"
          style={
            {
              "--poster-aspect": `${aspect}`,
              "--poster-bg": effectiveTheme.gradient_color || effectiveTheme.bg,
            } as CSSProperties
          }
        >
          <MapPreview
            style={mapStyle}
            center={mapCenter}
            zoom={mapZoom}
            mapRef={mapRef}
            interactive={isEditing && isMoveMode}
            minZoom={mapMinZoom}
            maxZoom={mapMaxZoom}
            onMoveEnd={handleMoveEnd}
          />
          <GradientFades
            color={effectiveTheme.gradient_color || effectiveTheme.bg}
          />
          <PosterTextOverlay
            city={form.displayCity || form.location || "Your City"}
            country={form.displayCountry || ""}
            lat={formLat}
            lon={formLon}
            fontFamily={form.fontFamily}
            textColor={effectiveTheme.text}
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
                  className={`map-control-btn${isMoveMode ? " is-active" : ""}`}
                  onClick={handleToggleMoveMode}
                  title={
                    isMoveMode
                      ? "Disable move mode"
                      : "Enable move mode (drag/scroll/pinch)"
                  }
                >
                  <MoveIcon />
                </button>
                <button
                  type="button"
                  className="map-control-btn"
                  onClick={handleZoomIn}
                  title="Zoom in"
                >
                  <PlusIcon />
                </button>
                <button
                  type="button"
                  className="map-control-btn"
                  onClick={handleZoomOut}
                  title="Zoom out"
                >
                  <MinusIcon />
                </button>
              </div>
              <p className="map-control-hint">
                {isMoveMode ? EDIT_HINT_ACTIVE : EDIT_HINT_MOVE_OFF}
              </p>
            </>
          )}
        </div>
      </section>
    </section>
  );
}
