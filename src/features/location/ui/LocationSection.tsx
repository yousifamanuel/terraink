import type { SearchResult } from "../domain/types";
import type { PosterForm } from "@/features/poster/application/posterReducer";
import { MARKER_STYLES } from "@/features/poster/application/posterReducer";
import type { MarkerStyle } from "@/features/poster/application/posterReducer";
import {
  PLACEHOLDER_LOCATION_SEARCH,
  PLACEHOLDER_EXAMPLE_LATITUDE,
  PLACEHOLDER_EXAMPLE_LONGITUDE,
} from "./constants";

interface LocationSectionProps {
  form: PosterForm;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onLocationFocus: () => void;
  onLocationBlur: () => void;
  showLocationSuggestions: boolean;
  locationSuggestions: SearchResult[];
  isLocationSearching: boolean;
  onLocationSelect: (suggestion: SearchResult) => void;
  onClearLocation: () => void;
  onMarkerStyleChange?: (style: MarkerStyle) => void;
  onMarkerSizeChange?: (size: number) => void;
  onMarkerColorChange?: (color: string) => void;
}

export default function LocationSection({
  form,
  onChange,
  onLocationFocus,
  onLocationBlur,
  showLocationSuggestions,
  locationSuggestions,
  isLocationSearching,
  onLocationSelect,
  onClearLocation,
  onMarkerStyleChange,
  onMarkerSizeChange,
  onMarkerColorChange,
}: LocationSectionProps) {
  const hasLocationValue = form.location.trim().length > 0;

  return (
    <section className="panel-block">
      <h2>Location</h2>
      <label>
        Location
        <div className="location-autocomplete">
          <div className="location-input-wrap">
            <input
              className="form-control-tall"
              name="location"
              value={form.location}
              onChange={onChange}
              onFocus={onLocationFocus}
              onBlur={onLocationBlur}
              placeholder={PLACEHOLDER_LOCATION_SEARCH}
              autoComplete="off"
            />
            {hasLocationValue ? (
              <button
                type="button"
                className="location-clear-btn"
                aria-label="Clear location"
                onMouseDown={(event) => event.preventDefault()}
                onClick={onClearLocation}
              >
                x
              </button>
            ) : null}
          </div>
          {showLocationSuggestions ? (
            <ul className="location-suggestions" role="listbox">
              {locationSuggestions.map((suggestion) => (
                <li key={suggestion.id}>
                  <button
                    type="button"
                    className="location-suggestion"
                    onMouseDown={(event) => {
                      event.preventDefault();
                      onLocationSelect(suggestion);
                    }}
                  >
                    {suggestion.label}
                  </button>
                </li>
              ))}
              {isLocationSearching ? (
                <li className="location-suggestion-status">Searching...</li>
              ) : null}
            </ul>
          ) : null}
        </div>
      </label>
      <div className="field-grid keep-two-mobile">
        <label>
          Latitude (optional)
          <input
            className="form-control-tall"
            name="latitude"
            value={form.latitude}
            onChange={onChange}
            placeholder={PLACEHOLDER_EXAMPLE_LATITUDE}
          />
        </label>
        <label>
          Longitude (optional)
          <input
            className="form-control-tall"
            name="longitude"
            value={form.longitude}
            onChange={onChange}
            placeholder={PLACEHOLDER_EXAMPLE_LONGITUDE}
          />
        </label>
      </div>
      <label className="toggle-field">
        <span>Show Marker</span>
        <span className="theme-switch">
          <input
            type="checkbox"
            name="showMarker"
            checked={Boolean(form.showMarker)}
            onChange={onChange}
          />
          <span className="theme-switch-track" aria-hidden="true" />
        </span>
      </label>
      {form.showMarker && (
        <div className="marker-settings">
          <div className="marker-style-picker">
            <span className="marker-style-label">Marker Style</span>
            <div className="marker-style-options">
              {MARKER_STYLES.map((ms) => (
                <button
                  key={ms.id}
                  type="button"
                  className={`marker-style-btn${form.markerStyle === ms.id ? " is-active" : ""}`}
                  title={ms.label}
                  onClick={() => onMarkerStyleChange?.(ms.id)}
                >
                  <span className="marker-style-icon">{ms.icon}</span>
                  <span className="marker-style-name">{ms.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="marker-size-field">
            <div className="marker-size-header">
              <span className="marker-style-label">Size</span>
              <span className="marker-size-value">{form.markerSize}px</span>
            </div>
            <input
              type="range"
              className="marker-size-slider"
              min={20}
              max={80}
              step={2}
              value={form.markerSize}
              onChange={(e) => onMarkerSizeChange?.(Number(e.target.value))}
            />
          </div>

          <div className="marker-color-field">
            <span className="marker-style-label">Color</span>
            <div className="marker-color-row">
              <button
                type="button"
                className={`marker-color-auto-btn${!form.markerColor ? " is-active" : ""}`}
                onClick={() => onMarkerColorChange?.("")}
              >
                Auto
              </button>
              <div className="marker-color-picker-wrap">
                <input
                  type="color"
                  className="marker-color-input"
                  value={form.markerColor || "#ffffff"}
                  onChange={(e) => onMarkerColorChange?.(e.target.value)}
                />
                <span className="marker-color-swatch" style={{ backgroundColor: form.markerColor || undefined }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

