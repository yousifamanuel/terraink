import { useState } from "react";
import type { SearchResult } from "../domain/types";
import type { PosterForm } from "@/features/poster/application/posterReducer";
import {
  PLACEHOLDER_LOCATION_SEARCH,
  PLACEHOLDER_EXAMPLE_LATITUDE,
  PLACEHOLDER_EXAMPLE_LONGITUDE,
} from "./constants";
import { MyLocationIcon } from "@/shared/ui/Icons";
import { useLocale } from "@/core/i18n/LocaleContext";
import {
  getQuickCityGroups,
  mapQuickCityToSearchResult,
} from "@/features/location/domain/quickCities";

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
  onUseCurrentLocation: () => void;
  isLocatingUser: boolean;
  locationPermissionMessage: string;
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
  onUseCurrentLocation,
  isLocatingUser,
  locationPermissionMessage,
}: LocationSectionProps) {
  const { locale, t } = useLocale();
  const hasLocationValue = form.location.trim().length > 0;
  const [quickCitiesOpen, setQuickCitiesOpen] = useState(false);
  const quickCityGroups = getQuickCityGroups(locale);

  return (
    <section className="panel-block">
      <h2>{t("location.heading")}</h2>
      <label>
        {t("location.field")}
        <div className="location-autocomplete">
          <div className="location-search-row">
            <div className="location-input-wrap">
              <input
                className="form-control-tall"
                name="location"
                value={form.location}
                onChange={onChange}
                onFocus={onLocationFocus}
                onBlur={onLocationBlur}
                placeholder={
                  t("location.placeholder.search") || PLACEHOLDER_LOCATION_SEARCH
                }
                autoComplete="off"
              />
              {hasLocationValue ? (
                <button
                  type="button"
                  className="location-clear-btn"
                  aria-label={t("location.clear")}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={onClearLocation}
                >
                  x
                </button>
              ) : null}
            </div>
            <button
              type="button"
              className="location-current-btn"
              onMouseDown={(event) => event.preventDefault()}
              onClick={onUseCurrentLocation}
              disabled={isLocatingUser}
              aria-label={t("location.useCurrent")}
              title={t("location.useCurrent")}
            >
              <MyLocationIcon />
            </button>
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
                          onMouseDown={(event) => event.preventDefault()}
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
                <li className="location-suggestion-status">
                  {t("location.searching")}
                </li>
              ) : null}
            </ul>
          ) : null}
          {locationPermissionMessage ? (
            <p className="location-permission-message">
              {locationPermissionMessage}
            </p>
          ) : null}
        </div>
      </label>
      <div className="field-grid keep-two-mobile">
        <label>
          {t("location.latitudeOptional")}
          <input
            className="form-control-tall"
            name="latitude"
            value={form.latitude}
            onChange={onChange}
            placeholder={
              t("location.placeholder.latitude") ||
              PLACEHOLDER_EXAMPLE_LATITUDE
            }
          />
        </label>
        <label>
          {t("location.longitudeOptional")}
          <input
            className="form-control-tall"
            name="longitude"
            value={form.longitude}
            onChange={onChange}
            placeholder={
              t("location.placeholder.longitude") ||
              PLACEHOLDER_EXAMPLE_LONGITUDE
            }
          />
        </label>
      </div>
    </section>
  );
}
