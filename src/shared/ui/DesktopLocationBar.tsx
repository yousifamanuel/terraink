import { useState } from "react";
import { useLocale } from "@/core/i18n/LocaleContext";
import { usePosterContext } from "@/features/poster/ui/PosterContext";
import { useFormHandlers } from "@/features/poster/application/useFormHandlers";
import { useLocationAutocomplete } from "@/features/location/application/useLocationAutocomplete";
import { useMapSync } from "@/features/map/application/useMapSync";
import { reverseGeocodeCoordinates } from "@/core/services";
import { DEFAULT_DISTANCE_METERS } from "@/core/config";
import { GEOLOCATION_TIMEOUT_MS } from "@/features/map/infrastructure";
import {
  getGeolocationFailureMessage,
  requestCurrentPositionWithRetry,
} from "@/features/location/infrastructure";
import type { SearchResult } from "@/features/location/domain/types";
import {
  getQuickCityGroups,
  mapQuickCityToSearchResult,
} from "@/features/location/domain/quickCities";
import { MyLocationIcon, LocationIcon, SearchIcon } from "@/shared/ui/Icons";

/**
 * Desktop floating location bar.
 * Renders a pill-shaped search row with a search icon on the left,
 * a coords-toggle pin button, and a GPS button on the right.
 * Clicking the pin icon shows/hides the lat/lon coordinate fields.
 */
export default function DesktopLocationBar() {
  const { locale, t } = useLocale();
  const { state, dispatch } = usePosterContext();
  const {
    handleChange,
    handleLocationSelect: handleLocationSelectBase,
    handleClearLocation,
    setLocationFocused,
  } = useFormHandlers();
  const { locationSuggestions, isLocationSearching } = useLocationAutocomplete(
    state.form.location,
    state.isLocationFocused,
  );
  const { flyToLocation } = useMapSync();

  const [isLocatingUser, setIsLocatingUser] = useState(false);
  const [locationPermissionMessage, setLocationPermissionMessage] = useState("");
  const [showCoords, setShowCoords] = useState(false);
  const [quickCitiesOpen, setQuickCitiesOpen] = useState(false);

  const hasLocationValue = state.form.location.trim().length > 0;
  const showLocationSuggestions =
    state.isLocationFocused && locationSuggestions.length > 0;
  const quickCityGroups = getQuickCityGroups(locale);

  const onLocationSelect = (location: SearchResult) => {
    handleLocationSelectBase(location);
    flyToLocation(location.lat, location.lon);
  };

  const handleUseCurrentLocation = () => {
    if (isLocatingUser) return;

    const applyLocation = async (lat: number, lon: number) => {
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
      try {
        const resolved = await reverseGeocodeCoordinates(lat, lon);
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
      } catch {
        const fallback: SearchResult = {
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
          fields: { location: fallback.label },
        });
        dispatch({ type: "SET_USER_LOCATION", location: fallback });
      }
    };

    setIsLocatingUser(true);
    void (async () => {
      const positionResult = await requestCurrentPositionWithRetry({
        timeoutMs: GEOLOCATION_TIMEOUT_MS,
        maxAttempts: 2,
      });

      if (positionResult.ok) {
        await applyLocation(positionResult.lat, positionResult.lon);
        setIsLocatingUser(false);
        return;
      } else {
        const failureReason =
          "reason" in positionResult ? positionResult.reason : "error";
        setLocationPermissionMessage(
          getGeolocationFailureMessage(failureReason, { locale }),
        );
        setIsLocatingUser(false);
      }
    })();
  };

  return (
    <div className={`dsk-loc-bar${showCoords ? " show-coords" : ""}`}>
      <div className="location-autocomplete">
        <div className="location-search-stack">
          <div className="location-search-main-row">
            <div className="location-search-row">
              <span className="location-search-icon" aria-hidden="true">
                <SearchIcon />
              </span>
              <div className="location-input-wrap">
                <input
                  className="form-control-tall"
                  name="location"
                  value={state.form.location}
                  onChange={handleChange}
                  onFocus={() => setLocationFocused(true)}
                  onBlur={() => setLocationFocused(false)}
                  placeholder={t("location.placeholder.search")}
                  autoComplete="off"
                />
                {hasLocationValue ? (
                  <button
                    type="button"
                  className="location-clear-btn"
                    aria-label={t("location.clear")}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={handleClearLocation}
                  >
                    x
                  </button>
                ) : null}
              </div>
            </div>

            <div className="location-search-icons">
            <button
              type="button"
              className={`icon-only-btn location-row-icon-btn${isLocatingUser ? " is-locating" : ""}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleUseCurrentLocation}
              disabled={isLocatingUser}
              aria-label={t("location.useCurrent")}
              title={t("location.useCurrent")}
            >
              <MyLocationIcon className="location-current-icon" />
            </button>
            <button
              type="button"
              className={`icon-only-btn location-row-icon-btn${showCoords ? " is-active" : ""}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setShowCoords((v) => !v)}
              aria-label={t("location.toggleCoordinates")}
              title={t("location.toggleCoordinatesTitle")}
            >
              <LocationIcon />
            </button>
            </div>
          </div>

          <div className="location-quick-cities">
            <button
              type="button"
              className={`location-quick-cities__trigger${quickCitiesOpen ? " is-open" : ""}`}
              onClick={() => setQuickCitiesOpen((open) => !open)}
              aria-expanded={quickCitiesOpen}
            >
              {t("location.quickCitiesTrigger")}
            </button>
            {quickCitiesOpen ? (
              <div className="location-quick-cities__panel">
                {quickCityGroups.map((group) => (
                  <section
                    key={group.id}
                    className="location-quick-cities__group"
                    aria-label={group.label}
                  >
                    <h3 className="location-quick-cities__group-title">
                      {group.label}
                    </h3>
                    <div className="location-quick-cities__grid">
                      {group.cities.map((city) => (
                        <button
                          key={city.id}
                          type="button"
                          className="location-quick-cities__city"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            onLocationSelect(mapQuickCityToSearchResult(city));
                            setQuickCitiesOpen(false);
                          }}
                        >
                          {city.city}
                        </button>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            ) : null}
          </div>

          {showLocationSuggestions ? (
            <ul className="location-suggestions" role="listbox">
              {locationSuggestions.map((suggestion) => (
                <li key={suggestion.id}>
                  <button
                    type="button"
                    className="location-suggestion"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      onLocationSelect(suggestion);
                    }}
                  >
                    {suggestion.label}
                  </button>
                </li>
              ))}
              {isLocationSearching ? (
                <li className="location-suggestion-status">{t("location.searching")}</li>
              ) : null}
            </ul>
          ) : null}
        </div>

        {locationPermissionMessage ? (
          <p className="location-permission-message">{locationPermissionMessage}</p>
        ) : null}

        <div className="dsk-loc-coords">
          <label>
            {t("markers.latitude")}
            <input
              className="form-control-tall"
              name="latitude"
              value={state.form.latitude}
              onChange={handleChange}
              placeholder={t("location.placeholder.latitude")}
            />
          </label>
          <label>
            {t("markers.longitude")}
            <input
              className="form-control-tall"
              name="longitude"
              value={state.form.longitude}
              onChange={handleChange}
              placeholder={t("location.placeholder.longitude")}
            />
          </label>
        </div>
      </div>
    </div>
  );
}
