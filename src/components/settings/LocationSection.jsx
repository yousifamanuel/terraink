export default function LocationSection({
  form,
  onChange,
  onLocationFocus,
  onLocationBlur,
  showLocationSuggestions,
  locationSuggestions,
  isLocationSearching,
  onLocationSelect,
}) {
  return (
    <section className="panel-block">
      <h2>Location</h2>
      <label>
        Location
        <div className="location-autocomplete">
          <input
            name="location"
            value={form.location}
            onChange={onChange}
            onFocus={onLocationFocus}
            onBlur={onLocationBlur}
            placeholder="Start typing a city or place"
            autoComplete="off"
            required
          />
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
      <div className="field-grid">
        <label>
          Latitude (optional)
          <input
            name="latitude"
            value={form.latitude}
            onChange={onChange}
            placeholder="48.8566"
          />
        </label>
        <label>
          Longitude (optional)
          <input
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
