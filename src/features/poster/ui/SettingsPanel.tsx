import { useState, type FormEvent } from "react";
import { usePosterContext } from "@/features/poster/ui/PosterContext";
import { useFormHandlers } from "@/features/poster/application/useFormHandlers";
import { usePosterGeneration } from "@/features/poster/application/usePosterGeneration";
import { useExport } from "@/features/export/application/useExport";
import { useLocationAutocomplete } from "@/features/location/application/useLocationAutocomplete";

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
  } = useFormHandlers();
  const { handleGenerate } = usePosterGeneration();
  const { handleDownloadPng, handleDownloadPdf } = useExport();
  const { locationSuggestions, isLocationSearching } = useLocationAutocomplete(
    state.form.location,
    state.isLocationFocused,
  );

  const [isColorEditorActive, setIsColorEditorActive] = useState(false);

  const showLocationSuggestions =
    state.isLocationFocused && locationSuggestions.length > 0;

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleGenerate();
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
          onLocationSelect={handleLocationSelect}
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
        />
      )}

      {!isColorEditorActive && (
        <div className="action-row">
          <button
            type="submit"
            className="generate-btn"
            disabled={state.isGenerating}
          >
            {state.isGenerating
              ? `Generating... ${state.generationProgress}%`
              : "Generate Poster"}
          </button>
          <div className="download-row">
            <button
              type="button"
              className="ghost download-format-btn"
              onClick={handleDownloadPng}
              disabled={!state.result}
            >
              <DownloadIcon className="download-btn-icon" />
              <span>PNG</span>
            </button>
            <button
              type="button"
              className="ghost download-format-btn"
              onClick={handleDownloadPdf}
              disabled={!state.result}
            >
              <DownloadIcon className="download-btn-icon" />
              <span>PDF</span>
            </button>
          </div>
        </div>
      )}

      {!isColorEditorActive && state.status && (
        <p className="status">{state.status}</p>
      )}
      {!isColorEditorActive && state.error && (
        <p className="error">{state.error}</p>
      )}
    </form>
  );
}
