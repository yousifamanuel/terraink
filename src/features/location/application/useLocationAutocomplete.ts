import { useCallback, useEffect, useRef, useState } from "react";
import { searchLocations } from "@/core/services";
import type { SearchResult } from "@/features/location/domain/types";

interface UseLocationAutocompleteReturn {
  locationSuggestions: SearchResult[];
  isLocationSearching: boolean;
  clearLocationSuggestions: () => void;
  searchNow: (query: string) => Promise<void>;
}

// Suggestions after 1 s without typing; Enter searches right away (searchNow).
const DEBOUNCE_DELAY_MS = 1000;

export function useLocationAutocomplete(
  locationInput: string,
  isFocused: boolean,
): UseLocationAutocompleteReturn {
  const [locationSuggestions, setLocationSuggestions] = useState<
    SearchResult[]
  >([]);
  const [isLocationSearching, setIsLocationSearching] = useState(false);
  const latestQueryRef = useRef("");
  const debounceIdRef = useRef<number | undefined>(undefined);
  const abortRef = useRef<AbortController | null>(null);

  const performSearch = useCallback(async (query: string) => {
    const q = String(query ?? "").trim();
    if (q.length < 2) {
      setLocationSuggestions([]);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    latestQueryRef.current = q;
    setIsLocationSearching(true);

    try {
      const results = await searchLocations(q, 6, controller.signal);
      if (latestQueryRef.current === q) {
        setLocationSuggestions(results);
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        return;
      }
      if (latestQueryRef.current === q) {
        setLocationSuggestions([]);
      }
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
      }
      if (latestQueryRef.current === q) {
        setIsLocationSearching(false);
      }
    }
  }, []);

  const searchNow = useCallback(
    async (query: string) => {
      // Cancel any pending debounce so it doesn't fire again after the immediate search
      window.clearTimeout(debounceIdRef.current);
      debounceIdRef.current = undefined;
      await performSearch(query);
    },
    [performSearch],
  );

  useEffect(() => {
    const query = String(locationInput ?? "").trim();
    if (!isFocused || query.length < 2) {
      latestQueryRef.current = "";
      setLocationSuggestions([]);
      setIsLocationSearching(false);
      return undefined;
    }

    let cancelled = false;
    debounceIdRef.current = window.setTimeout(() => {
      if (!cancelled) {
        void performSearch(query);
      }
    }, DEBOUNCE_DELAY_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(debounceIdRef.current);
      debounceIdRef.current = undefined;
      abortRef.current?.abort();
      abortRef.current = null;
    };
  }, [locationInput, isFocused, performSearch]);

  const clearLocationSuggestions = useCallback(() => {
    setLocationSuggestions([]);
  }, []);

  return {
    locationSuggestions,
    isLocationSearching,
    clearLocationSuggestions,
    searchNow,
  };
}
