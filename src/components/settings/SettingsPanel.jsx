import LocationSection from "./LocationSection";
import MapSettingsSection from "./MapSettingsSection";
import TypographySection from "./TypographySection";

export default function SettingsPanel({
  form,
  onSubmit,
  onChange,
  onThemeChange,
  selectedTheme,
  themeOptions,
  minPosterCm,
  maxPosterCm,
  fontOptions,
  isGenerating,
  generationProgress,
  onDownload,
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
}) {
  return (
    <form className="settings-panel" onSubmit={onSubmit}>
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

      <MapSettingsSection
        form={form}
        onChange={onChange}
        onThemeChange={onThemeChange}
        selectedTheme={selectedTheme}
        themeOptions={themeOptions}
        minPosterCm={minPosterCm}
        maxPosterCm={maxPosterCm}
      />

      <TypographySection
        form={form}
        onChange={onChange}
        fontOptions={fontOptions}
      />

      <div className="action-row">
        <button type="submit" disabled={isGenerating}>
          {isGenerating
            ? `Generating... ${generationProgress}%`
            : "Generate Poster"}
        </button>
        <button
          type="button"
          className="ghost"
          onClick={onDownload}
          disabled={!hasResult}
        >
          Download PNG
        </button>
      </div>

      {status ? <p className="status">{status}</p> : null}
      {error ? <p className="error">{error}</p> : null}
    </form>
  );
}
