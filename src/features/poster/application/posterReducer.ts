import type { SearchResult } from "@/features/location/domain/types";
import { parseLocationParts } from "@/shared/utils/location";

/* ────── Form state ────── */

export interface PosterForm {
  location: string;
  latitude: string;
  longitude: string;
  distance: string;
  width: string;
  height: string;
  theme: string;
  layout: string;
  displayCity: string;
  displayCountry: string;
  fontFamily: string;
  showPosterText: boolean;
  includeCredits: boolean;
}

/* ────── App-level state ────── */

export interface PosterState {
  form: PosterForm;
  customColors: Record<string, string>;
  error: string;
  isExporting: boolean;
  isLocationFocused: boolean;
  selectedLocation: SearchResult | null;
}

/* ────── Actions ────── */

export type PosterAction =
  | { type: "SET_FIELD"; name: string; value: string | boolean }
  | { type: "SET_FORM_FIELDS"; fields: Partial<PosterForm> }
  | { type: "SET_THEME"; themeId: string }
  | { type: "SET_LAYOUT"; layoutId: string; widthCm: string; heightCm: string }
  | { type: "SET_COLOR"; key: string; value: string }
  | { type: "RESET_COLORS" }
  | { type: "SELECT_LOCATION"; location: SearchResult }
  | { type: "CLEAR_LOCATION" }
  | { type: "SET_LOCATION_FOCUSED"; focused: boolean }
  | { type: "SET_ERROR"; error: string }
  | { type: "START_EXPORT" }
  | { type: "FINISH_EXPORT" }
  | { type: "FAIL_EXPORT"; error: string };

/* ────── Reducer ────── */

export function posterReducer(
  state: PosterState,
  action: PosterAction,
): PosterState {
  switch (action.type) {
    case "SET_FIELD": {
      const nextForm = { ...state.form, [action.name]: action.value };

      if (action.name === "location" && typeof action.value === "string") {
        const parts = parseLocationParts(action.value);
        nextForm.displayCity = parts.city;
        nextForm.displayCountry = parts.country;
      }

      return {
        ...state,
        form: nextForm,
        // Clear selected location when location/lat/lon field changes
        ...(["location", "latitude", "longitude"].includes(action.name)
          ? { selectedLocation: null }
          : {}),
      };
    }

    case "SET_FORM_FIELDS":
      return {
        ...state,
        form: { ...state.form, ...action.fields },
      };

    case "SET_THEME":
      return {
        ...state,
        form: { ...state.form, theme: action.themeId },
        customColors: {},
      };

    case "SET_LAYOUT":
      return {
        ...state,
        form: {
          ...state.form,
          layout: action.layoutId,
          width: action.widthCm,
          height: action.heightCm,
        },
      };

    case "SET_COLOR":
      return {
        ...state,
        customColors: { ...state.customColors, [action.key]: action.value },
      };

    case "RESET_COLORS":
      return { ...state, customColors: {} };

    case "SELECT_LOCATION":
      return {
        ...state,
        selectedLocation: action.location,
        isLocationFocused: false,
        form: {
          ...state.form,
          location: action.location.label,
          latitude: action.location.lat.toFixed(6),
          longitude: action.location.lon.toFixed(6),
          displayCity: action.location.city,
          displayCountry: action.location.country,
        },
      };

    case "CLEAR_LOCATION":
      return {
        ...state,
        selectedLocation: null,
        form: {
          ...state.form,
          location: "",
          displayCity: "",
          displayCountry: "",
        },
      };

    case "SET_LOCATION_FOCUSED":
      return { ...state, isLocationFocused: action.focused };

    case "SET_ERROR":
      return { ...state, error: action.error };

    case "START_EXPORT":
      return { ...state, error: "", isExporting: true };

    case "FINISH_EXPORT":
      return { ...state, isExporting: false };

    case "FAIL_EXPORT":
      return { ...state, error: action.error, isExporting: false };

    default:
      return state;
  }
}
