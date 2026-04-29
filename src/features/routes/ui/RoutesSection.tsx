import { useCallback, useMemo, useRef, useState, type ChangeEvent } from "react";
import { createPortal } from "react-dom";
import { usePosterContext } from "@/features/poster/ui/PosterContext";
import { useGpxUpload } from "@/features/routes/application/useGpxUpload";
import type {
  Route,
  RouteBounds,
  RouteEndpointMarker,
} from "@/features/routes/domain/types";
import {
  MAX_MARKER_SIZE,
  MIN_MARKER_SIZE,
} from "@/features/markers/domain/constants";
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
import { CheckIcon, CloseIcon, TrashIcon } from "@/shared/ui/Icons";
import MarkerVisual from "@/features/markers/ui/MarkerVisual";
import {
  findMarkerIcon,
  predefinedMarkerIcons,
} from "@/features/markers/infrastructure/iconRegistry";

type RouteEndpointKind = "start" | "finish";

interface EndpointPickerState {
  routeId: string;
  kind: RouteEndpointKind;
}

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
  const { form, routes, customMarkerIcons } = state;
  const { uploadGpxFile, confirmAddRoute, confirmReplaceRoutes } =
    useGpxUpload();

  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [openRouteId, setOpenRouteId] = useState<string | null>(null);
  const [openColorPickerId, setOpenColorPickerId] = useState<string | null>(
    null,
  );
  const [activeEndpoint, setActiveEndpoint] =
    useState<EndpointPickerState | null>(null);
  const [isEndpointIconOpen, setIsEndpointIconOpen] = useState(false);
  const [isEndpointColorOpen, setIsEndpointColorOpen] = useState(false);
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
      setActiveEndpoint((current) =>
        current?.routeId === routeId ? null : current,
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
    setActiveEndpoint(null);
    setIsEndpointIconOpen(false);
    setIsEndpointColorOpen(false);
  }, []);

  const closeCard = useCallback(() => {
    setOpenRouteId(null);
    setOpenColorPickerId(null);
    setActiveEndpoint(null);
    setIsEndpointIconOpen(false);
    setIsEndpointColorOpen(false);
  }, []);

  const openEndpointEditor = useCallback(
    (routeId: string, kind: RouteEndpointKind) => {
      setActiveEndpoint({ routeId, kind });
      setIsEndpointIconOpen(false);
      setIsEndpointColorOpen(false);
      setOpenColorPickerId(null);
    },
    [],
  );

  const closeEndpointEditor = useCallback(() => {
    setActiveEndpoint(null);
    setIsEndpointIconOpen(false);
    setIsEndpointColorOpen(false);
  }, []);

  const updateEndpoint = useCallback(
    (
      routeId: string,
      kind: RouteEndpointKind,
      changes: Partial<RouteEndpointMarker>,
    ) => {
      const route = routes.find((r) => r.id === routeId);
      if (!route) return;
      const current = kind === "start" ? route.startMarker : route.finishMarker;
      const next: RouteEndpointMarker = { ...current, ...changes };
      dispatch({
        type: "UPDATE_ROUTE",
        routeId,
        changes:
          kind === "start"
            ? { startMarker: next }
            : { finishMarker: next },
      });
    },
    [dispatch, routes],
  );

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
          const endpointKind =
            activeEndpoint?.routeId === route.id ? activeEndpoint.kind : null;
          const isEditingEndpoint = endpointKind !== null;

          return (
            <article
              key={route.id}
              className={`route-card${isOpen ? " is-open" : ""}`}
            >
              {!isOpen ? (
                <button
                  type="button"
                  className="route-card__delete"
                  onClick={() => removeRoute(route.id)}
                  title="Remove route"
                  aria-label={`Remove ${route.label}`}
                >
                  <CloseIcon />
                </button>
              ) : (
                <button
                  type="button"
                  className="route-card__done"
                  onClick={
                    isEditingEndpoint ? closeEndpointEditor : closeCard
                  }
                  title={isEditingEndpoint ? "Finish endpoint" : "Done"}
                  aria-label={
                    isEditingEndpoint ? "Finish endpoint" : "Done editing route"
                  }
                >
                  <CheckIcon />
                </button>
              )}

              <button
                type="button"
                className="route-card__summary"
                onClick={() => toggleCardOpen(route.id)}
                aria-expanded={isOpen}
                disabled={isEditingEndpoint}
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
                  <span className="route-card__label">
                    {isEditingEndpoint
                      ? `Edit ${endpointKind === "start" ? "Start" : "Finish"}`
                      : route.label}
                  </span>
                  <span className="route-card__distance">
                    {isEditingEndpoint ? route.label : distanceLabel}
                  </span>
                </span>
              </button>

              {isOpen && isEditingEndpoint ? (() => {
                const endpoint =
                  endpointKind === "start"
                    ? route.startMarker
                    : route.finishMarker;
                const icon = findMarkerIcon(endpoint.iconId, customMarkerIcons);
                const endpointColorChoices = buildDynamicColorChoices(
                  endpoint.color,
                  palette,
                );
                return (
                  <div className="route-card__body">
                    <div className="route-card__field">
                      <label>
                        <span>Icon</span>
                        <button
                          type="button"
                          className="route-card__endpoint-toggle"
                          onClick={() =>
                            setIsEndpointIconOpen((current) => !current)
                          }
                          aria-expanded={isEndpointIconOpen}
                          aria-label={
                            isEndpointIconOpen
                              ? "Close icon picker"
                              : "Change icon"
                          }
                        >
                          {icon ? (
                            <MarkerVisual
                              icon={icon}
                              size={22}
                              color={endpoint.color}
                            />
                          ) : null}
                        </button>
                      </label>
                      {isEndpointIconOpen ? (
                        <div className="route-card__endpoint-picker">
                          {predefinedMarkerIcons.map((option) => (
                            <button
                              key={option.id}
                              type="button"
                              className={`route-card__endpoint-option${
                                option.id === endpoint.iconId
                                  ? " is-selected"
                                  : ""
                              }`}
                              onClick={() =>
                                updateEndpoint(route.id, endpointKind!, {
                                  iconId: option.id,
                                })
                              }
                              title={option.label}
                              aria-label={option.label}
                            >
                              <MarkerVisual
                                icon={option}
                                size={24}
                                color={endpoint.color}
                              />
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </div>

                    <div className="route-card__field">
                      <label>
                        <span>Color</span>
                        <button
                          type="button"
                          className="route-card__color-toggle"
                          style={{ backgroundColor: endpoint.color }}
                          onClick={() =>
                            setIsEndpointColorOpen((current) => !current)
                          }
                          aria-label={
                            isEndpointColorOpen
                              ? "Close color picker"
                              : "Open color picker"
                          }
                        >
                          {isEndpointColorOpen ? <CloseIcon /> : null}
                        </button>
                      </label>
                      {isEndpointColorOpen ? (
                        <ColorPicker
                          currentColor={endpoint.color}
                          suggestedColors={endpointColorChoices.suggestedColors}
                          moreColors={endpointColorChoices.moreColors}
                          onChange={(color) =>
                            updateEndpoint(route.id, endpointKind!, { color })
                          }
                          onResetColor={() =>
                            updateEndpoint(route.id, endpointKind!, {
                              color: route.color,
                            })
                          }
                        />
                      ) : null}
                    </div>

                    <div className="route-card__field">
                      <label
                        htmlFor={`route-${route.id}-${endpointKind}-size`}
                      >
                        <span>Size</span>
                        <span className="route-card__value">
                          {endpoint.size}px
                        </span>
                      </label>
                      <input
                        id={`route-${route.id}-${endpointKind}-size`}
                        type="range"
                        min={MIN_MARKER_SIZE}
                        max={MAX_MARKER_SIZE}
                        step={1}
                        value={endpoint.size}
                        onChange={(event) =>
                          updateEndpoint(route.id, endpointKind!, {
                            size: Number(event.target.value),
                          })
                        }
                      />
                    </div>
                  </div>
                );
              })() : null}

              {isOpen && !isEditingEndpoint ? (
                <div className="route-card__body">
                  <label className="toggle-field">
                    <span>Show endpoints</span>
                    <span className="theme-switch">
                      <input
                        type="checkbox"
                        checked={route.showEndpoints}
                        onChange={(event) =>
                          updateRoute(route.id, {
                            showEndpoints: event.target.checked,
                          })
                        }
                      />
                      <span className="theme-switch-track" aria-hidden="true" />
                    </span>
                  </label>

                  {route.showEndpoints ? (
                    <div className="route-card__endpoint-rows">
                      {(["start", "finish"] as const).map((kind) => {
                        const endpoint =
                          kind === "start"
                            ? route.startMarker
                            : route.finishMarker;
                        const icon = findMarkerIcon(
                          endpoint.iconId,
                          customMarkerIcons,
                        );
                        const label = kind === "start" ? "Start" : "Finish";
                        return (
                          <button
                            key={kind}
                            type="button"
                            className="route-card__endpoint-row"
                            onClick={() => openEndpointEditor(route.id, kind)}
                            aria-label={`Edit ${label.toLowerCase()} marker`}
                          >
                            <span className="route-card__endpoint-row-icon">
                              {icon ? (
                                <MarkerVisual
                                  icon={icon}
                                  size={24}
                                  color={endpoint.color}
                                />
                              ) : null}
                            </span>
                            <span className="route-card__endpoint-row-label">
                              {label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ) : null}

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

                  <div className="route-card__actions">
                    <button
                      type="button"
                      className="marker-row__icon-btn marker-row__icon-btn--danger"
                      onClick={() => removeRoute(route.id)}
                      title="Remove route"
                    >
                      <TrashIcon />
                      <span className="marker-row__icon-btn-label">
                        Remove Route
                      </span>
                    </button>
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
