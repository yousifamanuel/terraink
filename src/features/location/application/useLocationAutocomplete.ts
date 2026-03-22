import { useCallback, useEffect, useState } from "react";
import { searchLocations } from "@/core/services";
import type { SearchResult } from "@/features/location/domain/types";

interface UseLocationAutocompleteReturn {
  locationSuggestions: SearchResult[];
  isLocationSearching: boolean;
  clearLocationSuggestions: () => void;
  searchNow: (query: string) => Promise<void>;
}

const DEBOUNCE_DELAY_MS = 1000;

// Track in-flight requests globally to deduplicate across multiple hook instances
const inFlightRequests = new Map<string, Promise<SearchResult[]>>();

export function useLocationAutocomplete(
  locationInput: string,
  isFocused: boolean,
): UseLocationAutocompleteReturn {
  const [locationSuggestions, setLocationSuggestions] = useState<
    SearchResult[]
  >([]);
  const [isLocationSearching, setIsLocationSearching] = useState(false);

  const performSearch = useCallback(async (query: string) => {
    const q = String(query ?? "").trim();
    if (q.length < 2) {
      setLocationSuggestions([]);
      return;
    }

    // Check if this query is already in-flight
    if (inFlightRequests.has(q)) {
      const cachedResult = await inFlightRequests.get(q);
      setLocationSuggestions(cachedResult as SearchResult[]);
      return;
    }

    setIsLocationSearching(true);
    const promise = searchLocations(q, 6)
      .then((suggestions) => {
        const result = suggestions as SearchResult[];
        setLocationSuggestions(result);
        inFlightRequests.delete(q);
        return result;
      })
      .catch(() => {
        setLocationSuggestions([]);
        inFlightRequests.delete(q);
        return [];
      })
      .finally(() => {
        setIsLocationSearching(false);
      });

    inFlightRequests.set(q, promise);
  }, []);

  useEffect(() => {
    const query = String(locationInput ?? "").trim();
    if (!isFocused || query.length < 2) {
      setLocationSuggestions([]);
      setIsLocationSearching(false);
      return undefined;
    }

    let cancelled = false;
    const debounceId = window.setTimeout(async () => {
      if (!cancelled) {
        void performSearch(query);
      }
    }, DEBOUNCE_DELAY_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(debounceId);
    };
  }, [locationInput, isFocused, performSearch]);

  const clearLocationSuggestions = useCallback(() => {
    setLocationSuggestions([]);
  }, []);

  return {
    locationSuggestions,
    isLocationSearching,
    clearLocationSuggestions,
    searchNow: performSearch,
  };
}
