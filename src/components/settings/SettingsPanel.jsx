import { useState } from "react";
import LocationSection from "./LocationSection";
import MapSettingsSection from "./MapSettingsSection";
import TypographySection from "./TypographySection";

export default function SettingsPanel({
  form,
  onSubmit,
  onChange,
  onNumericFieldBlur,
  onThemeChange,
  onLayoutChange,
  selectedTheme,
  themeOptions,
  layoutGroups,
  minPosterCm,
  maxPosterCm,
  fontOptions,
  isGenerating,
  generationProgress,
  onDownloadPng,
  onDownloadPdf,
  hasResult,
  status,
  error,
  showLocationSuggestions,
  locationSuggestions,
  isLocationSearching,
  onLocationSelect,
  onClearLocation,
  onLocationFocus,
  onLocationBlur,
  customColors,
  onColorChange,
  onResetColors,
}) {
  const [isColorEditorActive, setIsColorEditorActive] = useState(false);

  return (
    <form className="settings-panel" onSubmit={onSubmit}>
      {!isColorEditorActive ? (
        <LocationSection
          form={form}
          onChange={onChange}
          onLocationFocus={onLocationFocus}
          onLocationBlur={onLocationBlur}
          showLocationSuggestions={showLocationSuggestions}
          locationSuggestions={locationSuggestions}
          isLocationSearching={isLocationSearching}
          onLocationSelect={onLocationSelect}
          onClearLocation={onClearLocation}
        />
      ) : null}

      <MapSettingsSection
        form={form}
        onChange={onChange}
        onNumericFieldBlur={onNumericFieldBlur}
        onThemeChange={onThemeChange}
        onLayoutChange={onLayoutChange}
        selectedTheme={selectedTheme}
        themeOptions={themeOptions}
        layoutGroups={layoutGroups}
        minPosterCm={minPosterCm}
        maxPosterCm={maxPosterCm}
        customColors={customColors}
        onColorChange={onColorChange}
        onResetColors={onResetColors}
        onColorEditorActiveChange={setIsColorEditorActive}
      />

      {!isColorEditorActive ? (
        <TypographySection
          form={form}
          onChange={onChange}
          fontOptions={fontOptions}
        />
      ) : null}

      {!isColorEditorActive ? (
        <div className="action-row">
          <button type="submit" className="generate-btn" disabled={isGenerating}>
            {isGenerating
              ? `Generating... ${generationProgress}%`
              : "Generate Poster"}
          </button>
          <div className="download-row">
            <button
              type="button"
              className="ghost download-format-btn"
              onClick={onDownloadPng}
              disabled={!hasResult}
            >
              <span className="download-btn-icon" aria-hidden="true">
                <svg viewBox="0 0 16 16" focusable="false">
                  <path d="M8 2v7m0 0L5.3 6.6M8 9l2.7-2.4M3 11.6h10" />
                </svg>
              </span>
              <span>PNG</span>
            </button>
            <button
              type="button"
              className="ghost download-format-btn"
              onClick={onDownloadPdf}
              disabled={!hasResult}
            >
              <span className="download-btn-icon" aria-hidden="true">
                <svg viewBox="0 0 16 16" focusable="false">
                  <path d="M8 2v7m0 0L5.3 6.6M8 9l2.7-2.4M3 11.6h10" />
                </svg>
              </span>
              <span>PDF</span>
            </button>
          </div>
        </div>
      ) : null}

      {!isColorEditorActive && status ? <p className="status">{status}</p> : null}
      {!isColorEditorActive && error ? <p className="error">{error}</p> : null}
    </form>
  );
}

