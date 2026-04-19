import { useCallback, useMemo, useRef, useState, type ChangeEvent } from "react";
import { createPortal } from "react-dom";
import { usePosterContext } from "@/features/poster/ui/PosterContext";
import { useGpxUpload } from "@/features/routes/application/useGpxUpload";
import type { Route, RouteBounds } from "@/features/routes/domain/types";
import { routeLengthMeters } from "@/features/routes/infrastructure/helpers";
import {
  ROUTE_LINE_STYLES,
  MAX_ROUTE_OPACITY,
  MAX_ROUTE_STROKE_WIDTH,
  MIN_ROUTE_OPACITY,
  MIN_ROUTE_STROKE_WIDTH,
} from "@/features/routes/domain/constants";
import ColorPicker from "@/features/theme/ui/ColorPicker";
import { buildDynamicColorChoices } from "@/features/theme/domain/colorSuggestions";
import {
  DISPLAY_PALETTE_KEYS,
  type ThemeColorKey,
} from "@/features/theme/domain/types";
import { getThemeColorByPath } from "@/features/theme/domain/colorPaths";
import { CloseIcon } from "@/shared/ui/Icons";

function formatRouteDistance(meters: number): string {
  if (!Number.isFinite(meters) || meters <= 0) return "—";
  if (meters < 1000) return `${Math.round(meters)} m`;
  const km = meters / 1000;
  return km < 10 ? `${km.toFixed(2)} km` : `${km.toFixed(1)} km`;
}

interface PendingConfirmation {
  pendingRoute: Route;
  newBounds: RouteBounds;
}

function RouteBoundsWarningModal({
  onCancel,
  onContinue,
  onReplace,
}: {
  onCancel: () => void;
  onContinue: () => void;
  onReplace: () => void;
}) {
  return createPortal(
    <div
      className="picker-modal-backdrop"
      role="presentation"
      onClick={onCancel}
    >
      <div
        className="picker-modal marker-delete-confirm-modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="route-bounds-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="marker-delete-modal__body">
          <p
            className="marker-delete-modal__headline"
            id="route-bounds-modal-title"
          >
            This route is far from your current area
          </p>
          <p className="marker-delete-modal__text">
            Adding it will zoom the poster out to fit everything. You can also
            replace your existing routes with this one to keep a tighter view.
          </p>
          <div className="marker-delete-modal__actions">
            <button
              type="button"
              className="marker-delete-modal__cancel"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="button"
              className="marker-delete-modal__cancel"
              onClick={onReplace}
            >
              Replace existing
            </button>
            <button
              type="button"
              className="marker-delete-modal__confirm"
              onClick={onContinue}
            >
              Add anyway
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default function RoutesSection() {
  const { state, dispatch, effectiveTheme } = usePosterContext();
  const { form, routes } = state;
  const { uploadGpxFile, confirmAddRoute, confirmReplaceRoutes } =
    useGpxUpload();

  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [openRouteId, setOpenRouteId] = useState<string | null>(null);
  const [openColorPickerId, setOpenColorPickerId] = useState<string | null>(
    null,
  );
  const [pendingConfirmation, setPendingConfirmation] =
    useState<PendingConfirmation | null>(null);

  const palette = useMemo(
    () =>
      DISPLAY_PALETTE_KEYS.map((key) =>
        getThemeColorByPath(effectiveTheme, key as ThemeColorKey),
      ).filter(Boolean),
    [effectiveTheme],
  );

  const handleUploadClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleUploadChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = "";
      if (!file) return;

      setUploadError(null);
      setIsUploading(true);
      try {
        const result = await uploadGpxFile(file);
        if (result.status === "needs-confirmation") {
          setPendingConfirmation({
            pendingRoute: result.pendingRoute,
            newBounds: result.newBounds,
          });
        }
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : "Upload failed.");
      } finally {
        setIsUploading(false);
      }
    },
    [uploadGpxFile],
  );

  const updateRoute = useCallback(
    (routeId: string, changes: Partial<Route>) => {
      dispatch({ type: "UPDATE_ROUTE", routeId, changes });
    },
    [dispatch],
  );

  const removeRoute = useCallback(
    (routeId: string) => {
      dispatch({ type: "REMOVE_ROUTE", routeId });
      setOpenRouteId((current) => (current === routeId ? null : current));
      setOpenColorPickerId((current) =>
        current === routeId ? null : current,
      );
    },
    [dispatch],
  );

  const toggleShowAll = useCallback(() => {
    dispatch({
      type: "SET_FIELD",
      name: "showRoutes",
      value: !form.showRoutes,
    });
  }, [dispatch, form.showRoutes]);

  const toggleCardOpen = useCallback((routeId: string) => {
    setOpenRouteId((current) => (current === routeId ? null : routeId));
    setOpenColorPickerId(null);
  }, []);

  return (
    <section className="panel-block routes-settings-screen">
      {pendingConfirmation ? (
        <RouteBoundsWarningModal
          onCancel={() => setPendingConfirmation(null)}
          onContinue={() => {
            confirmAddRoute(
              pendingConfirmation.pendingRoute,
              pendingConfirmation.newBounds,
            );
            setPendingConfirmation(null);
          }}
          onReplace={() => {
            confirmReplaceRoutes(
              pendingConfirmation.pendingRoute,
              pendingConfirmation.newBounds,
            );
            setPendingConfirmation(null);
          }}
        />
      ) : null}

      <div className="markers-section-head">
        <p className="section-summary-label">ROUTES</p>
        <div className="markers-section-head-actions">
          <button
            type="button"
            className="marker-row__icon-btn marker-header-action-btn"
            onClick={toggleShowAll}
            title={form.showRoutes ? "Hide routes" : "Show routes"}
            disabled={routes.length === 0}
          >
            <span className="marker-row__icon-btn-label">
              {form.showRoutes ? "Hide All" : "Show All"}
            </span>
          </button>
          <button
            type="button"
            className="marker-row__icon-btn marker-header-action-btn"
            onClick={handleUploadClick}
            title="Upload GPX file"
            disabled={isUploading}
          >
            <span className="marker-row__icon-btn-label">
              {isUploading ? "Uploading…" : "Upload GPX"}
            </span>
          </button>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".gpx,application/gpx+xml,application/xml,text/xml"
        onChange={handleUploadChange}
        style={{ display: "none" }}
      />

      {uploadError ? (
        <p className="routes-section__error" role="alert">
          {uploadError}
        </p>
      ) : null}

      <div className="routes-section__content">
        {routes.length === 0 ? (
          <p className="routes-section__empty">
            Upload a <code>.gpx</code> file to draw a route on the poster.
            Drawing routes manually is coming soon.
          </p>
        ) : null}

        {routes.map((route) => {
          const isOpen = openRouteId === route.id;
          const isColorOpen = openColorPickerId === route.id;
          const colorChoices = buildDynamicColorChoices(route.color, palette);
          const distanceLabel = formatRouteDistance(routeLengthMeters(route));

          return (
            <article
              key={route.id}
              className={`route-card${isOpen ? " is-open" : ""}`}
            >
              <button
                type="button"
                className="route-card__delete"
                onClick={() => removeRoute(route.id)}
                title="Remove route"
                aria-label={`Remove ${route.label}`}
              >
                <CloseIcon />
              </button>

              <button
                type="button"
                className="route-card__summary"
                onClick={() => toggleCardOpen(route.id)}
                aria-expanded={isOpen}
              >
                <span
                  className="route-card__swatch"
                  style={{
                    backgroundColor: route.color,
                    opacity: route.opacity,
                  }}
                  aria-hidden="true"
                />
                <span className="route-card__meta">
                  <span className="route-card__label">{route.label}</span>
                  <span className="route-card__distance">{distanceLabel}</span>
                </span>
              </button>

              {isOpen ? (
                <div className="route-card__body">
                  <div className="route-card__field">
                    <label>
                      <span>Color</span>
                      <button
                        type="button"
                        className="route-card__color-toggle"
                        style={{ backgroundColor: route.color }}
                        onClick={() =>
                          setOpenColorPickerId(isColorOpen ? null : route.id)
                        }
                        aria-label={
                          isColorOpen ? "Close color picker" : "Open color picker"
                        }
                      >
                        {isColorOpen ? <CloseIcon /> : null}
                      </button>
                    </label>
                    {isColorOpen ? (
                      <ColorPicker
                        currentColor={route.color}
                        suggestedColors={colorChoices.suggestedColors}
                        moreColors={colorChoices.moreColors}
                        onChange={(color) => updateRoute(route.id, { color })}
                        onResetColor={() =>
                          updateRoute(route.id, {
                            color: state.routeDefaults.color,
                          })
                        }
                      />
                    ) : null}
                  </div>

                  <div className="route-card__field">
                    <label htmlFor={`route-width-${route.id}`}>
                      <span>Width</span>
                      <span className="route-card__value">
                        {route.strokeWidth}px
                      </span>
                    </label>
                    <input
                      id={`route-width-${route.id}`}
                      type="range"
                      min={MIN_ROUTE_STROKE_WIDTH}
                      max={MAX_ROUTE_STROKE_WIDTH}
                      step={1}
                      value={route.strokeWidth}
                      onChange={(event) =>
                        updateRoute(route.id, {
                          strokeWidth: Number(event.target.value),
                        })
                      }
                    />
                  </div>

                  <div className="route-card__field">
                    <label htmlFor={`route-opacity-${route.id}`}>
                      <span>Opacity</span>
                      <span className="route-card__value">
                        {Math.round(route.opacity * 100)}%
                      </span>
                    </label>
                    <input
                      id={`route-opacity-${route.id}`}
                      type="range"
                      min={MIN_ROUTE_OPACITY}
                      max={MAX_ROUTE_OPACITY}
                      step={0.05}
                      value={route.opacity}
                      onChange={(event) =>
                        updateRoute(route.id, {
                          opacity: Number(event.target.value),
                        })
                      }
                    />
                  </div>

                  <div className="route-card__field">
                    <label>
                      <span>Style</span>
                    </label>
                    <div className="route-card__style-toggle">
                      {ROUTE_LINE_STYLES.map((style) => (
                        <button
                          key={style}
                          type="button"
                          className={`route-card__style-btn${route.lineStyle === style ? " is-active" : ""}`}
                          onClick={() =>
                            updateRoute(route.id, { lineStyle: style })
                          }
                        >
                          <span>{style === "solid" ? "Solid" : "Dashed"}</span>
                          <svg
                            className="route-card__style-preview"
                            width="28"
                            height="8"
                            viewBox="0 0 28 8"
                            aria-hidden="true"
                          >
                            <line
                              x1="1"
                              y1="4"
                              x2="27"
                              y2="4"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeDasharray={style === "dashed" ? "4 3" : undefined}
                            />
                          </svg>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
