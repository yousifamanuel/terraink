import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { usePosterContext } from "@/features/poster/ui/PosterContext";
import type {
  MarkerDefaults,
  MarkerItem,
} from "@/features/markers/domain/types";
import MarkerPicker from "./MarkerPicker";
import {
  createMarkerItem,
  createUploadedMarkerIcon,
  getUploadLabel,
} from "@/features/markers/infrastructure/helpers";
import { findMarkerIcon } from "@/features/markers/infrastructure/iconRegistry";
import {
  DEFAULT_MARKER_SIZE,
  MAX_MARKER_SIZE,
  MIN_MARKER_SIZE,
} from "@/features/markers/infrastructure/constants";
import MarkerVisual from "./MarkerVisual";
import {
  CheckIcon,
  CloseIcon,
  EditIcon,
  GearIcon,
  InfoIcon,
  RotateLeftIcon,
  TrashIcon,
} from "@/shared/ui/Icons";
import ColorPicker from "@/features/theme/ui/ColorPicker";
import { buildDynamicColorChoices } from "@/features/theme/domain/colorSuggestions";
import {
  DISPLAY_PALETTE_KEYS,
  type ThemeColorKey,
} from "@/features/theme/domain/types";
import { getThemeColorByPath } from "@/features/theme/domain/colorPaths";
import { useLocale } from "@/core/i18n/LocaleContext";

function formatMessage(template: string, values: Record<string, string>) {
  return Object.entries(values).reduce(
    (message, [key, value]) => message.replace(`{${key}}`, value),
    template,
  );
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Could not read marker upload."));
    reader.readAsDataURL(file);
  });
}

function isHexColor(value: string) {
  return /^#[0-9a-f]{6}$/i.test(value);
}

function isSvgFile(file: File) {
  return (
    file.type === "image/svg+xml" || file.name.toLowerCase().endsWith(".svg")
  );
}

function formatCoordinate(value: number) {
  return Number(value).toFixed(6);
}

function DeleteAllMarkersModal({
  markerCount,
  onCancel,
  onConfirm,
}: {
  markerCount: number;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const { t } = useLocale();
  const markerWord =
    markerCount === 1 ? t("markers.markerWord.one") : t("markers.markerWord.other");

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
        aria-labelledby="marker-delete-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="marker-delete-modal-body">
          <p
            className="marker-delete-modal-headline"
            id="marker-delete-modal-title"
          >
            {t("markers.deleteAll.headline")}
          </p>
          <p className="marker-delete-modal-text">
            {formatMessage(t("markers.deleteAll.text"), {
              count: String(markerCount),
              markerWord,
            })}
          </p>
          <div className="marker-delete-modal-actions">
            <button
              type="button"
              className="marker-delete-modal-cancel"
              onClick={onCancel}
            >
              {t("markers.deleteAll.keep")}
            </button>
            <button
              type="button"
              className="marker-delete-modal-confirm"
              onClick={onConfirm}
            >
              <TrashIcon />
              {t("markers.deleteAll.confirm")}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default function MarkersSection() {
  const { t } = useLocale();
  const { state, dispatch, mapRef, effectiveTheme } = usePosterContext();
  const {
    form,
    markers,
    customMarkerIcons,
    markerDefaults,
    isMarkerEditorActive,
    activeMarkerId,
  } = state;
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDefaultColorPickerOpen, setIsDefaultColorPickerOpen] =
    useState(false);
  const [openMarkerColorPickerId, setOpenMarkerColorPickerId] = useState<
    string | null
  >(null);
  const [expandedMarkerId, setExpandedMarkerId] = useState<string | null>(null);
  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const markerThemeColor = effectiveTheme.ui.text;
  const hasMarkers = markers.length > 0;
  const isColorPickerFocused =
    isMarkerEditorActive &&
    expandedMarkerId !== null &&
    openMarkerColorPickerId === expandedMarkerId;

  const toggleMarkerEditor = useCallback((markerId: string) => {
    setExpandedMarkerId((current) => {
      const next = current === markerId ? null : markerId;
      dispatch({ type: "SET_ACTIVE_MARKER", markerId: next });
      return next;
    });
    setOpenMarkerColorPickerId((current) =>
      current === markerId ? null : current,
    );
  }, [dispatch]);

  const openMarkerEditor = useCallback(
    (markerId: string) => {
      setExpandedMarkerId(markerId);
      setOpenMarkerColorPickerId(null);
      dispatch({ type: "SET_ACTIVE_MARKER", markerId });
    },
    [dispatch],
  );

  const removeMarker = useCallback(
    (markerId: string) => {
      dispatch({ type: "REMOVE_MARKER", markerId });
      if (activeMarkerId === markerId) {
        dispatch({ type: "SET_ACTIVE_MARKER", markerId: null });
        setExpandedMarkerId(null);
        setOpenMarkerColorPickerId(null);
      }
    },
    [activeMarkerId, dispatch],
  );

  const updateMarker = useCallback(
    (markerId: string, changes: Partial<MarkerItem>) => {
      dispatch({ type: "UPDATE_MARKER", markerId, changes });
    },
    [dispatch],
  );

  const applyMarkerDefaults = useCallback(
    (defaults: Partial<MarkerDefaults>) => {
      dispatch({
        type: "SET_MARKER_DEFAULTS",
        defaults,
        applyToMarkers: true,
      });
    },
    [dispatch],
  );

  const addMarker = useCallback(
    (iconId: string) => {
      const center = mapRef.current?.getCenter();
      const fallbackLat = Number(form.latitude) || 0;
      const fallbackLon = Number(form.longitude) || 0;
      const lat = center?.lat ?? fallbackLat;
      const lon = center?.lng ?? fallbackLon;

      dispatch({
        type: "ADD_MARKER",
        marker: createMarkerItem({
          lat,
          lon,
          iconId,
          defaults: markerDefaults,
        }),
      });
    },
    [dispatch, form.latitude, form.longitude, mapRef, markerDefaults],
  );

  const handleUploadIcon = useCallback(
    async (file: File) => {
      const dataUrl = await readFileAsDataUrl(file);
      const icon = createUploadedMarkerIcon({
        label: getUploadLabel(file.name),
        dataUrl,
        tintWithMarkerColor: isSvgFile(file),
      });

      dispatch({ type: "ADD_CUSTOM_MARKER_ICON", icon });
      addMarker(icon.id);
    },
    [addMarker, dispatch],
  );

  const markerRows = useMemo(
    () => {
      const iconCounts = new Map<string, number>();
      return markers.map((marker, index) => {
      const icon = findMarkerIcon(marker.iconId, customMarkerIcons);
        const defaultMarkerLabel = t("markers.marker");
        const iconLabel =
          String(icon?.label ?? defaultMarkerLabel).trim() || defaultMarkerLabel;
        const nextCount = (iconCounts.get(iconLabel) ?? 0) + 1;
        iconCounts.set(iconLabel, nextCount);
        return {
          marker,
          index,
          icon,
          markerLabel: `${iconLabel} ${nextCount}`,
          isExpanded: expandedMarkerId === marker.id,
        };
      });
    },
    [customMarkerIcons, expandedMarkerId, markers],
  );

  const markerColorPalette = useMemo(
    () =>
      DISPLAY_PALETTE_KEYS.map((key) =>
        getThemeColorByPath(effectiveTheme, key as ThemeColorKey),
      ).filter(Boolean),
    [effectiveTheme],
  );

  const defaultColorChoices = useMemo(
    () => buildDynamicColorChoices(markerDefaults.color, markerColorPalette),
    [markerDefaults.color, markerColorPalette],
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const mediaQuery = window.matchMedia(
      "(max-width: 768px), (hover: none) and (pointer: coarse)",
    );
    const syncViewport = () => setIsMobileViewport(mediaQuery.matches);
    syncViewport();
    mediaQuery.addEventListener("change", syncViewport);
    return () => mediaQuery.removeEventListener("change", syncViewport);
  }, []);

  useEffect(() => {
    if (isMarkerEditorActive) {
      return;
    }
    setExpandedMarkerId(null);
    setOpenMarkerColorPickerId(null);
    setIsDefaultColorPickerOpen(false);
  }, [isMarkerEditorActive]);

  useEffect(() => {
    if (!isMarkerEditorActive) {
      return;
    }

    if (!activeMarkerId) {
      return;
    }

    const activeMarkerStillExists = markers.some(
      (marker) => marker.id === activeMarkerId,
    );
    if (!activeMarkerStillExists) {
      setExpandedMarkerId(null);
      setOpenMarkerColorPickerId(null);
      return;
    }

    setExpandedMarkerId(activeMarkerId);
  }, [activeMarkerId, isMarkerEditorActive, markers]);

  const toggleMarkerSettings = useCallback(() => {
    setIsSettingsOpen((current) => {
      const next = !current;
      if (!next) {
        setIsDefaultColorPickerOpen(false);
      }
      return next;
    });
  }, []);

  const toggleDefaultColorPicker = useCallback(() => {
    setIsDefaultColorPickerOpen((current) => !current);
  }, []);

  const handleResetMarkers = useCallback(() => {
    dispatch({
      type: "SET_MARKER_DEFAULTS",
      defaults: { size: DEFAULT_MARKER_SIZE, color: markerThemeColor },
      applyToMarkers: true,
    });
  }, [dispatch, markerThemeColor]);

  const handleDeleteAllMarkers = useCallback(() => {
    if (markers.length > 0) {
      setIsDeleteAllModalOpen(true);
    }
  }, [markers.length]);

  const toggleMarkerEditMode = useCallback(() => {
    const next = !isMarkerEditorActive;
    if (next) {
      setIsSettingsOpen(false);
      setIsDefaultColorPickerOpen(false);
    }
    dispatch({ type: "SET_MARKER_EDITOR_ACTIVE", active: next });
    if (!next) {
      dispatch({ type: "SET_ACTIVE_MARKER", markerId: null });
      setExpandedMarkerId(null);
      setOpenMarkerColorPickerId(null);
    }
  }, [dispatch, isMarkerEditorActive]);

  const visibleMarkerRows =
    isMarkerEditorActive && expandedMarkerId
      ? markerRows.filter(({ marker }) => marker.id === expandedMarkerId)
      : markerRows;
  const activeColorPickerMarker =
    expandedMarkerId && openMarkerColorPickerId === expandedMarkerId
      ? markerRows.find(({ marker }) => marker.id === expandedMarkerId) ?? null
      : null;
  const markerHelpText = isMobileViewport
    ? t("markers.help.mobile")
    : t("markers.help.desktop");

  return (
    <section className="panel-block color-editor-screen marker-settings-screen">
      {isDeleteAllModalOpen ? (
        <DeleteAllMarkersModal
          markerCount={markers.length}
          onCancel={() => setIsDeleteAllModalOpen(false)}
          onConfirm={() => {
            dispatch({ type: "CLEAR_MARKERS" });
            setExpandedMarkerId(null);
            setOpenMarkerColorPickerId(null);
            setIsDeleteAllModalOpen(false);
          }}
        />
      ) : null}

      <div className="markers-section-head">
        <p className="section-summary-label">{t("markers.section")}</p>
        <div className="markers-section-head-actions">
          {!isMarkerEditorActive ? (
            <button
              type="button"
              className={`marker-row__icon-btn marker-header-action-btn marker-header-settings-btn${isSettingsOpen ? " is-active" : " is-compact"}`}
              onClick={toggleMarkerSettings}
              aria-label={
                isSettingsOpen
                  ? t("markers.settingsDone")
                  : t("markers.openSettings")
              }
              title={
                isSettingsOpen
                  ? t("markers.settingsDone")
                  : t("markers.openSettings")
              }
            >
              <span className="marker-row__icon-btn-icon" aria-hidden="true">
                {isSettingsOpen ? <CheckIcon /> : <GearIcon />}
              </span>
              {isSettingsOpen ? (
                <span className="marker-row__icon-btn-label">{t("markers.done")}</span>
              ) : null}
            </button>
          ) : null}
          {isMarkerEditorActive || !isSettingsOpen ? (
            <button
              type="button"
              className={`marker-row__icon-btn marker-header-action-btn${isMarkerEditorActive ? " is-active" : ""}`}
              onClick={toggleMarkerEditMode}
              aria-label={
                isMarkerEditorActive
                  ? t("markers.finishEditing")
                  : t("markers.editMarkers")
              }
              title={
                isMarkerEditorActive
                  ? t("markers.finishEditing")
                  : t("markers.editMarkers")
              }
              disabled={!isMarkerEditorActive && !hasMarkers}
            >
              <span className="marker-row__icon-btn-icon" aria-hidden="true">
                {isMarkerEditorActive ? <CheckIcon /> : <EditIcon />}
              </span>
              <span className="marker-row__icon-btn-label">
                {isMarkerEditorActive ? t("markers.done") : t("markers.editMarkers")}
              </span>
            </button>
          ) : null}
          <div className="marker-info-wrap marker-info-wrap--top">
            <button
              type="button"
              className="icon-only-btn marker-info-btn"
              aria-label={t("markers.help")}
            >
              <InfoIcon />
            </button>
            <div className="marker-info-popover" role="tooltip">{markerHelpText}</div>
          </div>
        </div>
      </div>

      <div className="markers-section__content">
        {!isMarkerEditorActive && !isSettingsOpen ? (
          <MarkerPicker
            markerColor={markerDefaults.color}
            customIcons={customMarkerIcons}
            onIconClick={addMarker}
            onUploadIcon={handleUploadIcon}
            onRemoveUploadedIcon={(iconId) =>
              dispatch({ type: "REMOVE_CUSTOM_MARKER_ICON", iconId })
            }
            onClearUploadedIcons={() =>
              dispatch({ type: "CLEAR_CUSTOM_MARKER_ICONS" })
            }
          />
        ) : null}

        {!isMarkerEditorActive && isSettingsOpen ? (
          <div className="marker-settings-card">
            <div className="marker-settings-card__header">
              <h3>{t("markers.settings")}</h3>
            </div>
            <p className="marker-settings-card__theme-note">
              {t("markers.settingsNote")}
            </p>

            <div className="marker-editor-card__stack">
              <label>
                {t("markers.defaultSize")}
                <div className="marker-editor-card__size-row">
                  <input
                    className="marker-editor-card__size-slider"
                    type="range"
                    min={MIN_MARKER_SIZE}
                    max={MAX_MARKER_SIZE}
                    step="1"
                    value={markerDefaults.size}
                    onChange={(event) =>
                      applyMarkerDefaults({
                        size: Number(event.target.value),
                      })
                    }
                  />
                  <input
                    className="form-control-tall marker-editor-card__size-input"
                    type="number"
                    min={MIN_MARKER_SIZE}
                    max={MAX_MARKER_SIZE}
                    step="1"
                    value={markerDefaults.size}
                    onChange={(event) => {
                      const nextValue = Number(event.target.value);
                      if (Number.isFinite(nextValue)) {
                        applyMarkerDefaults({ size: nextValue });
                      }
                    }}
                  />
                </div>
              </label>

              <div className="marker-settings-card__theme-color">
                  <span className="marker-settings-card__theme-label">
                    {t("markers.defaultColor")}
                  </span>
                <div className="marker-color-control">
                  <button
                    type="button"
                    className="marker-color-display-btn"
                    onClick={toggleDefaultColorPicker}
                  >
                    <span
                      className="marker-editor-card__color-swatch"
                      aria-hidden="true"
                      style={{
                        backgroundColor: isHexColor(markerDefaults.color)
                          ? markerDefaults.color
                          : "#000000",
                      }}
                    />
                    <span className="marker-editor-card__color-value">
                      {markerDefaults.color}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {isDefaultColorPickerOpen ? (
              <ColorPicker
                currentColor={markerDefaults.color}
                suggestedColors={defaultColorChoices.suggestedColors}
                moreColors={defaultColorChoices.moreColors}
                onChange={(color) => applyMarkerDefaults({ color })}
                onResetColor={() =>
                  applyMarkerDefaults({ color: markerThemeColor })
                }
              />
            ) : null}
          </div>
        ) : null}

        {isMarkerEditorActive ? (
          <>
            {isColorPickerFocused && activeColorPickerMarker ? (
              <article className="marker-editor-card">
                <div className="marker-settings-card__header">
                  <h3>{t("markers.editColor")}</h3>
                  <button
                    type="button"
                    className="marker-row__icon-btn"
                    onClick={() => setOpenMarkerColorPickerId(null)}
                  >
                    <span className="marker-row__icon-btn-label">{t("markers.done")}</span>
                  </button>
                </div>
                <ColorPicker
                  currentColor={activeColorPickerMarker.marker.color}
                  suggestedColors={buildDynamicColorChoices(
                    activeColorPickerMarker.marker.color,
                    markerColorPalette,
                  ).suggestedColors}
                  moreColors={buildDynamicColorChoices(
                    activeColorPickerMarker.marker.color,
                    markerColorPalette,
                  ).moreColors}
                  onChange={(color) =>
                    updateMarker(activeColorPickerMarker.marker.id, { color })
                  }
                  onResetColor={() =>
                    updateMarker(activeColorPickerMarker.marker.id, {
                      color: markerDefaults.color,
                    })
                  }
                />
              </article>
            ) : (
              <>
                {visibleMarkerRows.length > 0 ? (
                  <>
                    {isMobileViewport && !expandedMarkerId ? (
                      <div className="markers-section__mobile-strip" role="list">
                        {markerRows.map(({ marker, icon, markerLabel }) => {
                          const isSelected = marker.id === activeMarkerId;
                          return (
                            <article
                              key={marker.id}
                              className={`marker-mobile-card${isSelected ? " is-selected" : ""}`}
                              role="listitem"
                            >
                              <button
                                type="button"
                                className="marker-mobile-card__delete"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  removeMarker(marker.id);
                                }}
                                title={t("markers.delete")}
                                aria-label={`Delete ${markerLabel}`}
                              >
                                <CloseIcon />
                              </button>
                              <button
                                type="button"
                                className="marker-mobile-card__select"
                                onClick={() => openMarkerEditor(marker.id)}
                                title={`${t("markers.edit")} ${markerLabel}`}
                              >
                                {icon ? (
                                  <MarkerVisual
                                    icon={icon}
                                    size={24}
                                    color={marker.color}
                                  />
                                ) : null}
                                <span className="marker-mobile-card__label">
                                  {markerLabel}
                                </span>
                              </button>
                            </article>
                          );
                        })}
                      </div>
                    ) : !expandedMarkerId ? (
                      <div className="markers-section__marker-grid" role="list">
                        {markerRows.map(({ marker, icon, markerLabel }) => {
                          const isSelected = marker.id === activeMarkerId;
                          return (
                            <article
                              key={marker.id}
                              className={`marker-mobile-card${isSelected ? " is-selected" : ""}`}
                              role="listitem"
                            >
                              <button
                                type="button"
                                className="marker-mobile-card__delete"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  removeMarker(marker.id);
                                }}
                                title={t("markers.delete")}
                                aria-label={`Delete ${markerLabel}`}
                              >
                                <CloseIcon />
                              </button>
                              <button
                                type="button"
                                className="marker-mobile-card__select"
                                onClick={() => openMarkerEditor(marker.id)}
                                title={`${t("markers.edit")} ${markerLabel}`}
                              >
                                {icon ? (
                                  <MarkerVisual
                                    icon={icon}
                                    size={24}
                                    color={marker.color}
                                  />
                                ) : null}
                                <span className="marker-mobile-card__label">
                                  {markerLabel}
                                </span>
                              </button>
                            </article>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="markers-section__list">
                        {visibleMarkerRows.map(
                          ({ marker, icon, markerLabel, isExpanded }) => {
                            return (
                              <article key={marker.id} className="marker-editor-card">
                                <div className="marker-row">
                                  <div className="marker-row__summary">
                                    {icon ? (
                                      <MarkerVisual
                                        icon={icon}
                                        size={26}
                                        color={marker.color}
                                      />
                                    ) : null}
                                    <span className="marker-row__title">{markerLabel}</span>
                                  </div>

                                  <div className="marker-row__actions">
                                    <button
                                      type="button"
                                      className="marker-row__icon-btn"
                                      onClick={() => toggleMarkerEditor(marker.id)}
                                      title={
                                        isExpanded
                                          ? t("markers.finishMarkerEditing")
                                          : t("markers.edit")
                                      }
                                    >
                                      <span
                                        className="marker-row__icon-btn-icon"
                                        aria-hidden="true"
                                      >
                                        {isExpanded ? <CheckIcon /> : <EditIcon />}
                                      </span>
                                      <span className="marker-row__icon-btn-label">
                                        {isExpanded ? t("markers.done") : t("markers.edit")}
                                      </span>
                                    </button>
                                    <button
                                      type="button"
                                      className="marker-row__icon-btn marker-row__icon-btn--danger"
                                      onClick={() => removeMarker(marker.id)}
                                      title={t("markers.delete")}
                                    >
                                      <TrashIcon />
                                    </button>
                                  </div>
                                </div>

                                {isExpanded ? (
                                  <div className="marker-editor-card__details">
                                    <div className="field-grid keep-two-mobile">
                                      <label>
                                        {t("markers.latitude")}
                                        <input
                                          className="form-control-tall"
                                          type="number"
                                          step="0.000001"
                                          value={formatCoordinate(marker.lat)}
                                          onChange={(event) => {
                                            const nextValue = Number(event.target.value);
                                            if (Number.isFinite(nextValue)) {
                                              updateMarker(marker.id, { lat: nextValue });
                                            }
                                          }}
                                        />
                                      </label>
                                      <label>
                                        {t("markers.longitude")}
                                        <input
                                          className="form-control-tall"
                                          type="number"
                                          step="0.000001"
                                          value={formatCoordinate(marker.lon)}
                                          onChange={(event) => {
                                            const nextValue = Number(event.target.value);
                                            if (Number.isFinite(nextValue)) {
                                              updateMarker(marker.id, { lon: nextValue });
                                            }
                                          }}
                                        />
                                      </label>
                                    </div>

                                    <div className="marker-editor-card__stack">
                                      <label>
                                        {t("markers.defaultSize")}
                                        <div className="marker-editor-card__size-row">
                                          <input
                                            className="marker-editor-card__size-slider"
                                            type="range"
                                            min={MIN_MARKER_SIZE}
                                            max={MAX_MARKER_SIZE}
                                            step="1"
                                            value={marker.size}
                                            onChange={(event) =>
                                              updateMarker(marker.id, {
                                                size: Number(event.target.value),
                                              })
                                            }
                                          />
                                          <input
                                            className="form-control-tall marker-editor-card__size-input"
                                            type="number"
                                            min={MIN_MARKER_SIZE}
                                            max={MAX_MARKER_SIZE}
                                            step="1"
                                            value={marker.size}
                                            onChange={(event) => {
                                              const nextValue = Number(event.target.value);
                                              if (Number.isFinite(nextValue)) {
                                                updateMarker(marker.id, { size: nextValue });
                                              }
                                            }}
                                          />
                                        </div>
                                      </label>
                                      <div>
                                        <span className="marker-settings-card__theme-label">
                                          {t("markers.color")}
                                        </span>
                                        <div className="marker-color-control">
                                          <button
                                            type="button"
                                            className="marker-color-display-btn"
                                            onClick={() =>
                                              setOpenMarkerColorPickerId((current) =>
                                                current === marker.id ? null : marker.id,
                                              )
                                            }
                                          >
                                            <span
                                              className="marker-editor-card__color-swatch"
                                              aria-hidden="true"
                                              style={{
                                                backgroundColor: isHexColor(marker.color)
                                                  ? marker.color
                                                  : "#000000",
                                              }}
                                            />
                                            <span className="marker-editor-card__color-value">
                                              {marker.color}
                                            </span>
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ) : null}
                              </article>
                            );
                          },
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <p className="marker-settings-card__theme-note">
                    {t("markers.unlockToEdit")}
                  </p>
                )}
                {!expandedMarkerId && hasMarkers ? (
                  <p className="marker-settings-toggle-hint marker-settings-toggle-hint--editor">
                    {isMobileViewport
                      ? t("markers.swipeHint.mobile")
                      : t("markers.swipeHint.desktop")}
                  </p>
                ) : null}

                {!expandedMarkerId && hasMarkers ? (
                  <div className="markers-section__actions">
                    <button
                      type="button"
                      className="marker-row__icon-btn"
                      onClick={handleResetMarkers}
                      title={t("markers.resetAll")}
                    >
                      <RotateLeftIcon />
                      <span className="marker-row__icon-btn-label">{t("markers.reset")}</span>
                    </button>
                    <button
                      type="button"
                      className="marker-row__icon-btn marker-row__icon-btn--danger"
                      onClick={handleDeleteAllMarkers}
                      title={t("markers.deleteAll")}
                    >
                      <TrashIcon />
                      <span className="marker-row__icon-btn-label">
                        {t("markers.deleteAll")}
                      </span>
                    </button>
                  </div>
                ) : null}
              </>
            )}
          </>
        ) : null}
      </div>
    </section>
  );
}
