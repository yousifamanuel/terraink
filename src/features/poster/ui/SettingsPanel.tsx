import { useState, type FormEvent } from "react";
import { usePosterContext } from "@/features/poster/ui/PosterContext";
import { useFormHandlers } from "@/features/poster/application/useFormHandlers";
import { useExport } from "@/features/export/application/useExport";
import { useLocationAutocomplete } from "@/features/location/application/useLocationAutocomplete";
import { useMapSync } from "@/features/map/application/useMapSync";

import LocationSection from "@/features/location/ui/LocationSection";
import MapSettingsSection from "@/features/map/ui/MapSettingsSection";
import TypographySection from "@/features/poster/ui/TypographySection";
import { DownloadIcon } from "@/shared/ui/Icons";

import { themeOptions } from "@/features/theme/infrastructure/themeRepository";
import { layoutGroups } from "@/features/layout/infrastructure/layoutRepository";
import { MIN_POSTER_CM, MAX_POSTER_CM, FONT_OPTIONS } from "@/core/config";

export default function SettingsPanel() {
  const { state, selectedTheme } = usePosterContext();
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

  const showLocationSuggestions =
    state.isLocationFocused && locationSuggestions.length > 0;

  /** When user selects a location, fly the map there. */
  const onLocationSelect = (location: any) => {
    handleLocationSelect(location);
    flyToLocation(location.lat, location.lon);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    // No generation step needed — the poster is always live
  };

  return (
    <form className="settings-panel" onSubmit={onSubmit}>
      {!isColorEditorActive && (
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
        />
      )}

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

      {!isColorEditorActive && (
        <TypographySection
          form={state.form}
          onChange={handleChange}
          fontOptions={FONT_OPTIONS}
          onCreditsChange={handleCreditsChange}
        />
      )}

      {!isColorEditorActive && (
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

      {!isColorEditorActive && state.error && (
        <p className="error">{state.error}</p>
      )}
    </form>
  );
}
