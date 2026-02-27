import type { SearchResult } from "../domain/types";
import type { PosterForm } from "@/features/poster/application/posterReducer";

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
              placeholder="Start typing a city or place"
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
            placeholder="48.8566"
          />
        </label>
        <label>
          Longitude (optional)
          <input
            className="form-control-tall"
            name="longitude"
            value={form.longitude}
            onChange={onChange}
            placeholder="2.3522"
          />
        </label>
      </div>
    </section>
  );
}
