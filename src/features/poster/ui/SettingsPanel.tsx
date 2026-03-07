import { useState, type FormEvent } from "react";
import { usePosterContext } from "@/features/poster/ui/PosterContext";
import { useFormHandlers } from "@/features/poster/application/useFormHandlers";
import { useExport } from "@/features/export/application/useExport";
import { useLocationAutocomplete } from "@/features/location/application/useLocationAutocomplete";
import { useMapSync } from "@/features/map/application/useMapSync";

import LocationSection from "@/features/location/ui/LocationSection";
import MapSettingsSection from "@/features/map/ui/MapSettingsSection";
import MarkersSection from "@/features/markers/ui/MarkersSection";
import TypographySection from "@/features/poster/ui/TypographySection";
import { DownloadIcon } from "@/shared/ui/Icons";

import { themeOptions } from "@/features/theme/infrastructure/themeRepository";
import { layoutGroups } from "@/features/layout/infrastructure/layoutRepository";
import {
  MIN_POSTER_CM,
  MAX_POSTER_CM,
  FONT_OPTIONS,
  DEFAULT_DISTANCE_METERS,
} from "@/core/config";
import { reverseGeocodeCoordinates } from "@/core/services";
import { GEOLOCATION_TIMEOUT_MS } from "@/features/map/infrastructure";
import type { SearchResult } from "@/features/location/domain/types";

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
  const { handleDownloadPng, handleDownloadPdf } = useExport();
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
  const isAuxEditorActive = isColorEditorActive || isMarkerEditorActive;

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

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    // No generation step needed — the poster is always live
  };

  return (
    <form className="settings-panel" onSubmit={onSubmit}>
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

      {!isAuxEditorActive && (
        <TypographySection
          form={state.form}
          onChange={handleChange}
          fontOptions={FONT_OPTIONS}
          onCreditsChange={handleCreditsChange}
        />
      )}

      {!isAuxEditorActive && (
        <div className="action-row">
          <div className="download-row">
            <button
              type="button"
              className="generate-btn download-format-btn"
              onClick={handleDownloadPng}
              disabled={state.isExporting}
            >
              <DownloadIcon className="download-btn-icon" />
              <span>{state.isExporting ? "Exporting..." : "Export PNG"}</span>
            </button>
            <button
              type="button"
              className="ghost download-format-btn"
              onClick={handleDownloadPdf}
              disabled={state.isExporting}
            >
              <DownloadIcon className="download-btn-icon" />
              <span>Export PDF</span>
            </button>
          </div>
        </div>
      )}

      {!isAuxEditorActive && state.error && (
        <p className="error">{state.error}</p>
      )}
    </form>
  );
}
