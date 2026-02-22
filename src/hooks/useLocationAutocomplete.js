import { useCallback, useEffect, useState } from "react";
import { searchLocations } from "../lib/osm";

export function useLocationAutocomplete(locationInput, isFocused) {
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [isLocationSearching, setIsLocationSearching] = useState(false);

  useEffect(() => {
    const query = String(locationInput ?? "").trim();
    if (!isFocused || query.length < 2) {
      setLocationSuggestions([]);
      setIsLocationSearching(false);
      return undefined;
    }

    let cancelled = false;
    const debounceId = window.setTimeout(async () => {
      setIsLocationSearching(true);
      try {
        const suggestions = await searchLocations(query, 6);
        if (!cancelled) {
          setLocationSuggestions(suggestions);
        }
      } catch {
        if (!cancelled) {
          setLocationSuggestions([]);
        }
      } finally {
        if (!cancelled) {
          setIsLocationSearching(false);
        }
      }
    }, 220);

    return () => {
      cancelled = true;
      window.clearTimeout(debounceId);
    };
  }, [locationInput, isFocused]);

  const clearLocationSuggestions = useCallback(() => {
    setLocationSuggestions([]);
  }, []);

  return {
    locationSuggestions,
    isLocationSearching,
    clearLocationSuggestions,
  };
}
