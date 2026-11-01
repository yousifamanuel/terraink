import { useEffect, useState } from "react";
import { trackEvent } from "@/core/services";
import { CloseIcon, HistoryIcon } from "@/shared/ui/Icons";
import type { RecentLocation, SearchResult } from "../domain/types";

const VISIBLE_RECENT_COUNT = 5;

interface LocationSuggestionsDropdownProps {
  query: string;
  isFocused: boolean;
  suggestions: SearchResult[];
  isSearching: boolean;
  onSelect: (suggestion: SearchResult) => void;
  recent: RecentLocation[];
  onRecentSelect: (entry: RecentLocation) => void;
  onRecentRemove: (id: string) => void;
  onClearRecent: () => void;
  /** Maps to the location-* vs startup-location-* CSS class families. */
  variant?: "bar" | "startup";
}

/**
 * Shared suggestions dropdown for all three search surfaces
 * (DesktopLocationBar, LocationSection, StartupLocationModal).
 * Live results when the query is searchable; otherwise the persisted
 * recent-locations history with show-more / delete / clear actions.
 * All interactions fire on mousedown (with preventDefault) so the input
 * never blurs before the action lands — same pattern as the old inline lists.
 */
export default function LocationSuggestionsDropdown({
  query,
  isFocused,
  suggestions,
  isSearching,
  onSelect,
  recent,
  onRecentSelect,
  onRecentRemove,
  onClearRecent,
  variant = "bar",
}: LocationSuggestionsDropdownProps) {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!isFocused) setExpanded(false);
  }, [isFocused]);

  const isLiveMode = query.trim().length >= 2;
  const prefix = variant === "startup" ? "startup-location" : "location";

  if (!isFocused) return null;
  if (isLiveMode && suggestions.length === 0) return null;
  if (!isLiveMode && recent.length === 0) return null;

  const visibleRecent = expanded
    ? recent
    : recent.slice(0, VISIBLE_RECENT_COUNT);

  return (
    <ul className={`${prefix}-suggestions`} role="listbox">
      {isLiveMode ? (
        <>
          {suggestions.map((suggestion) => (
            <li key={suggestion.id}>
              <button
                type="button"
                className={`${prefix}-suggestion`}
                onMouseDown={(event) => {
                  event.preventDefault();
                  onSelect(suggestion);
                }}
              >
                {suggestion.label}
              </button>
            </li>
          ))}
          {isSearching ? (
            <li className={`${prefix}-suggestion-status`}>Searching...</li>
          ) : null}
        </>
      ) : (
        <>
          {visibleRecent.map((entry, index) => (
            <li key={entry.id} className="location-recent-row">
              <button
                type="button"
                className={`${prefix}-suggestion location-recent-select`}
                onMouseDown={(event) => {
                  event.preventDefault();
                  trackEvent("recent_location_selected", { index });
                  onRecentSelect(entry);
                }}
              >
                <HistoryIcon className="location-recent-icon" aria-hidden="true" />
                <span className="location-recent-label">{entry.label}</span>
              </button>
              <button
                type="button"
                className="location-recent-remove"
                aria-label={`Remove ${entry.label} from history`}
                title="Remove from history"
                onMouseDown={(event) => {
                  event.preventDefault();
                  onRecentRemove(entry.id);
                }}
              >
                <CloseIcon />
              </button>
            </li>
          ))}
          {recent.length > VISIBLE_RECENT_COUNT ? (
            <li>
              <button
                type="button"
                className="location-suggestions-action"
                onMouseDown={(event) => {
                  event.preventDefault();
                  setExpanded((value) => !value);
                }}
              >
                {expanded ? "Show less" : "Show more"}
              </button>
            </li>
          ) : null}
          <li>
            <button
              type="button"
              className="location-suggestions-action location-suggestions-action--danger"
              onMouseDown={(event) => {
                event.preventDefault();
                onClearRecent();
              }}
            >
              Clear history
            </button>
          </li>
        </>
      )}
    </ul>
  );
}
