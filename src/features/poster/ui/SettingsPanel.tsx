import { useEffect, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { usePosterContext } from "@/features/poster/ui/PosterContext";
import { useFormHandlers } from "@/features/poster/application/useFormHandlers";
import { useExport } from "@/features/export/application/useExport";
import { useLocationAutocomplete } from "@/features/location/application/useLocationAutocomplete";
import { useMapSync } from "@/features/map/application/useMapSync";

import LocationSection from "@/features/location/ui/LocationSection";
import MapSettingsSection from "@/features/map/ui/MapSettingsSection";
import MarkersSection from "@/features/markers/ui/MarkersSection";
import TypographySection from "@/features/poster/ui/TypographySection";
import { DownloadIcon, LoaderIcon } from "@/shared/ui/Icons";

import { themeOptions } from "@/features/theme/infrastructure/themeRepository";
import { layoutGroups } from "@/features/layout/infrastructure/layoutRepository";
import {
  MIN_POSTER_CM,
  MAX_POSTER_CM,
  FONT_OPTIONS,
  DEFAULT_DISTANCE_METERS,
  KOFI_URL,
} from "@/core/config";
import { reverseGeocodeCoordinates } from "@/core/services";
import { GEOLOCATION_TIMEOUT_MS } from "@/features/map/infrastructure";
import type { SearchResult } from "@/features/location/domain/types";

function ExportSupportModal({
  posterNumber,
  isFirst,
  kofiUrl,
  onClose,
}: {
  posterNumber: number;
  isFirst: boolean;
  kofiUrl: string;
  onClose: () => void;
}) {
  return createPortal(
    <div
      className="picker-modal-backdrop"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="picker-modal credits-confirm-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-support-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="credits-modal-body">
          <p className="credits-modal-headline" id="export-support-modal-title">
            {isFirst
              ? "✨ Your first poster is ready!"
              : "✨ Your poster is ready!"}
          </p>
          <p className="credits-modal-text">
            {isFirst
              ? "That is an awesome start. I hope you enjoy using Terraink and keep creating map posters."
              : "If Terraink helped you create this poster, consider supporting the project on Ko-fi."}
          </p>
          <p className="credits-modal-text">
            This was your poster <strong>#{posterNumber}</strong> 🎉
          </p>
          <div className="credits-modal-actions">
            {kofiUrl ? (
              <a
                className="credits-modal-keep"
                href={kofiUrl}
                target="_blank"
                rel="noreferrer"
              >
                <span className="heart">❤︎</span> Support on Ko-fi
              </a>
            ) : null}
            <button
              type="button"
              className="credits-modal-remove"
              onClick={onClose}
            >
              {kofiUrl ? "Maybe later" : "Close"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default function SettingsPanel() {
  const { state, selectedTheme, dispatch } = usePosterContext();
  const {
    handleChange,
    handleNumericFieldBlur,
    handleThemeChange,
    handleLayoutChange,
    handleColorChange,
    handleResetColors,
    handleLocationSelect,
    handleClearLocation,
    setLocationFocused,
    handleCreditsChange,
  } = useFormHandlers();
  const {
    handleDownloadPng,
    handleDownloadPdf,
    handleDownloadSvg,
    supportPrompt,
    dismissSupportPrompt,
  } = useExport();
  const { locationSuggestions, isLocationSearching } = useLocationAutocomplete(
    state.form.location,
    state.isLocationFocused,
  );
  const { flyToLocation } = useMapSync();

  const [isColorEditorActive, setIsColorEditorActive] = useState(false);
  const [isMarkerEditorActive, setIsMarkerEditorActive] = useState(false);
  const [isLocatingUser, setIsLocatingUser] = useState(false);
  const [locationPermissionMessage, setLocationPermissionMessage] =
    useState("");
  const [activeExportFormat, setActiveExportFormat] = useState<
    "png" | "pdf" | "svg" | null
  >(null);
  const isAuxEditorActive = isColorEditorActive || isMarkerEditorActive;
  const kofiUrl = String(KOFI_URL ?? "").trim();

  const showLocationSuggestions =
    state.isLocationFocused && locationSuggestions.length > 0;

  /** When user selects a location, fly the map there. */
  const onLocationSelect = (location: SearchResult) => {
    handleLocationSelect(location);
    flyToLocation(location.lat, location.lon);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation || isLocatingUser) return;

    const applyLocation = (lat: number, lon: number) => {
      setLocationPermissionMessage("");
      flyToLocation(lat, lon);
      dispatch({
        type: "SET_FORM_FIELDS",
        resetDisplayNameOverrides: true,
        fields: {
          latitude: lat.toFixed(6),
          longitude: lon.toFixed(6),
          distance: String(DEFAULT_DISTANCE_METERS),
        },
      });
      void reverseGeocodeCoordinates(lat, lon)
        .then((resolved) => {
          dispatch({
            type: "SET_FORM_FIELDS",
            resetDisplayNameOverrides: true,
            fields: {
              location: resolved.label,
              displayCity: String(resolved.city ?? "").trim(),
              displayCountry: String(resolved.country ?? "").trim(),
              displayContinent: String(resolved.continent ?? "").trim(),
            },
          });
          dispatch({ type: "SET_USER_LOCATION", location: resolved });
        })
        .catch(() => {
          const fallbackLocation: SearchResult = {
            id: `user:${lat.toFixed(6)},${lon.toFixed(6)}`,
            label: `${lat.toFixed(6)}, ${lon.toFixed(6)}`,
            city: "",
            country: "",
            continent: "",
            lat,
            lon,
          };
          dispatch({
            type: "SET_FORM_FIELDS",
            resetDisplayNameOverrides: true,
            fields: {
              location: fallbackLocation.label,
            },
          });
          dispatch({ type: "SET_USER_LOCATION", location: fallbackLocation });
        })
        .finally(() => {
          setIsLocatingUser(false);
        });
    };

    const requestPosition = (retry = false) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          applyLocation(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          if (!retry) {
            // Retry once per click to re-trigger permission request where the browser allows it.
            requestPosition(true);
          } else {
            if (error?.code === 1) {
              setLocationPermissionMessage(
                "Location access is blocked. Please enable location permission for this website in your browser settings and try again. We do not track your location: this app runs fully client-side on your device and is open source.",
              );
            } else {
              setLocationPermissionMessage(
                "Could not get your current location right now. Please check browser location permissions and try again.",
              );
            }
            setIsLocatingUser(false);
          }
        },
        {
          enableHighAccuracy: retry,
          timeout: GEOLOCATION_TIMEOUT_MS,
          maximumAge: 0,
        },
      );
    };

    setIsLocatingUser(true);
    requestPosition(false);
  };

  const exportButtons = [
    {
      id: "png",
      label: "PNG",
      className: "generate-btn download-format-btn",
      onClick: () => {
        setActiveExportFormat("png");
        handleDownloadPng();
      },
    },
    {
      id: "pdf",
      label: "PDF",
      className: "ghost download-format-btn",
      onClick: () => {
        setActiveExportFormat("pdf");
        handleDownloadPdf();
      },
    },
    {
      id: "svg",
      label: "SVG",
      className: "download-format-btn export-map-btn",
      onClick: () => {
        setActiveExportFormat("svg");
        handleDownloadSvg();
      },
    },
  ] as const;

  useEffect(() => {
    if (!state.isExporting) {
      setActiveExportFormat(null);
    }
  }, [state.isExporting]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    // No generation step needed — the poster is always live
  };

  return (
    <form className="settings-panel" onSubmit={onSubmit}>
      <div className="mobile-section mobile-section--location">
        {!isAuxEditorActive && (
          <LocationSection
            form={state.form}
            onChange={handleChange}
            onLocationFocus={() => setLocationFocused(true)}
            onLocationBlur={() => setLocationFocused(false)}
            showLocationSuggestions={showLocationSuggestions}
            locationSuggestions={locationSuggestions}
            isLocationSearching={isLocationSearching}
            onLocationSelect={onLocationSelect}
            onClearLocation={handleClearLocation}
            onUseCurrentLocation={handleUseCurrentLocation}
            isLocatingUser={isLocatingUser}
            locationPermissionMessage={locationPermissionMessage}
          />
        )}
        {!isColorEditorActive && (
          <MarkersSection onEditorActiveChange={setIsMarkerEditorActive} />
        )}
      </div>

      <div className="mobile-section mobile-section--map-settings">
        {!isMarkerEditorActive && (
          <MapSettingsSection
            form={state.form}
            onChange={handleChange}
            onNumericFieldBlur={handleNumericFieldBlur}
            onThemeChange={handleThemeChange}
            onLayoutChange={handleLayoutChange}
            selectedTheme={selectedTheme}
            themeOptions={themeOptions}
            layoutGroups={layoutGroups}
            minPosterCm={MIN_POSTER_CM}
            maxPosterCm={MAX_POSTER_CM}
            customColors={state.customColors}
            onColorChange={handleColorChange}
            onResetColors={handleResetColors}
            onColorEditorActiveChange={setIsColorEditorActive}
          />
        )}
      </div>

      <div className="mobile-section mobile-section--style">
        {!isAuxEditorActive && (
          <TypographySection
            form={state.form}
            onChange={handleChange}
            fontOptions={FONT_OPTIONS}
            onCreditsChange={handleCreditsChange}
          />
        )}
      </div>

      <div className="mobile-section mobile-section--export">
        {!isAuxEditorActive && (
          <div className="action-row">
            <p className="export-map-label">Export Map</p>
            <div className="download-row">
              {exportButtons.map((button) => (
                <button
                  key={button.id}
                  type="button"
                  className={button.className}
                  onClick={button.onClick}
                  disabled={state.isExporting}
                >
                  {state.isExporting && activeExportFormat === button.id ? (
                    <LoaderIcon className="download-btn-icon is-spinning" />
                  ) : (
                    <DownloadIcon className="download-btn-icon" />
                  )}
                  <span>
                    {state.isExporting && activeExportFormat === button.id
                      ? "Exporting..."
                      : button.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {!isAuxEditorActive && state.error && (
          <p className="error">{state.error}</p>
        )}
      </div>

      {supportPrompt ? (
        <ExportSupportModal
          posterNumber={supportPrompt.posterNumber}
          isFirst={supportPrompt.isFirst}
          kofiUrl={kofiUrl}
          onClose={dismissSupportPrompt}
        />
      ) : null}
    </form>
  );
}
