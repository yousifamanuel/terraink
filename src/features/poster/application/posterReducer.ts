import type { SearchResult } from "@/features/location/domain/types";
import type { RenderResult, RenderCache } from "@/features/poster/domain/types";

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
  status: string;
  error: string;
  isGenerating: boolean;
  generationProgress: number;
  result: RenderResult | null;
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
  | { type: "SET_STATUS"; status: string }
  | { type: "SET_ERROR"; error: string }
  | { type: "SET_PROGRESS"; progress: number }
  | { type: "START_GENERATION" }
  | { type: "FINISH_GENERATION"; result: RenderResult }
  | { type: "FAIL_GENERATION"; error: string }
  | { type: "UPDATE_RESULT"; patch: Partial<RenderResult> };

/* ────── Reducer ────── */

export function posterReducer(
  state: PosterState,
  action: PosterAction,
): PosterState {
  switch (action.type) {
    case "SET_FIELD":
      return {
        ...state,
        form: { ...state.form, [action.name]: action.value },
        // Clear selected location when location/lat/lon field changes
        ...(["location", "latitude", "longitude"].includes(action.name)
          ? { selectedLocation: null }
          : {}),
      };

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
        },
      };

    case "CLEAR_LOCATION":
      return {
        ...state,
        selectedLocation: null,
        form: { ...state.form, location: "" },
      };

    case "SET_LOCATION_FOCUSED":
      return { ...state, isLocationFocused: action.focused };

    case "SET_STATUS":
      return { ...state, status: action.status };

    case "SET_ERROR":
      return { ...state, error: action.error };

    case "SET_PROGRESS":
      return {
        ...state,
        generationProgress: Math.max(state.generationProgress, action.progress),
      };

    case "START_GENERATION":
      return {
        ...state,
        error: "",
        status: "",
        result: null,
        generationProgress: 0,
        isGenerating: true,
      };

    case "FINISH_GENERATION":
      return {
        ...state,
        result: action.result,
        generationProgress: 100,
        status: "Poster ready.",
        isGenerating: false,
      };

    case "FAIL_GENERATION":
      return {
        ...state,
        error: action.error,
        generationProgress: 0,
        status: "",
        isGenerating: false,
      };

    case "UPDATE_RESULT":
      return {
        ...state,
        result: state.result ? { ...state.result, ...action.patch } : null,
      };

    default:
      return state;
  }
}
