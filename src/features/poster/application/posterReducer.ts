import type { SearchResult } from "@/features/location/domain/types";
import type {
  MarkerDefaults,
  MarkerIconDefinition,
  MarkerItem,
} from "@/features/markers/domain/types";
import {
  MAX_MARKER_SIZE,
  MIN_MARKER_SIZE,
} from "@/features/markers/domain/constants";
import { createDefaultMarkerSettings } from "@/features/markers/infrastructure/helpers";
import { featuredMarkerIcons } from "@/features/markers/infrastructure/iconRegistry";
import { clamp } from "@/shared/geo/math";
import type { Route, RouteDefaults } from "@/features/routes/domain/types";
import {
  MAX_ROUTE_OPACITY,
  MAX_ROUTE_STROKE_WIDTH,
  MIN_ROUTE_OPACITY,
  MIN_ROUTE_STROKE_WIDTH,
} from "@/features/routes/domain/constants";
import type { SavedTheme } from "@/features/theme/domain/types";

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
  displayContinent: string;
  fontFamily: string;
  showPosterText: boolean;
  includeCredits: boolean;
  includeLandcover: boolean;
  includeBuildings: boolean;
  includeWater: boolean;
  includeParks: boolean;
  includeAeroway: boolean;
  includeRail: boolean;
  includeRoads: boolean;
  includeRoadPath: boolean;
  includeRoadMinorLow: boolean;
  includeRoadOutline: boolean;
  showMarkers: boolean;
  showRoutes: boolean;
}

/* ────── App-level state ────── */

export interface PosterState {
  form: PosterForm;
  customColors: Record<string, string>;
  savedThemes: SavedTheme[];
  markers: MarkerItem[];
  customMarkerIcons: MarkerIconDefinition[];
  markerDefaults: MarkerDefaults;
  isMarkerEditorActive: boolean;
  activeMarkerId: string | null;
  routes: Route[];
  routeDefaults: RouteDefaults;
  error: string;
  isExporting: boolean;
  isLocationFocused: boolean;
  selectedLocation: SearchResult | null;
  userLocation: SearchResult | null;
  displayNameOverrides: {
    city: boolean;
    country: boolean;
  };
}

/* ────── Actions ────── */

export type PosterAction =
  | { type: "SET_FIELD"; name: string; value: string | boolean }
  | {
      type: "SET_FORM_FIELDS";
      fields: Partial<PosterForm>;
      resetDisplayNameOverrides?: boolean;
    }
  | { type: "SET_THEME"; themeId: string }
  | { type: "SET_LAYOUT"; layoutId: string; widthCm: string; heightCm: string }
  | { type: "SET_COLOR"; key: string; value: string }
  | { type: "SET_CUSTOM_COLORS"; colors: Record<string, string> }
  | { type: "RESET_COLORS" }
  | { type: "SET_SAVED_THEMES"; themes: SavedTheme[] }
  | { type: "ADD_SAVED_THEME"; theme: SavedTheme }
  | { type: "UPDATE_SAVED_THEME"; themeId: string; changes: Partial<SavedTheme> }
  | { type: "REMOVE_SAVED_THEME"; themeId: string }
  | { type: "SELECT_LOCATION"; location: SearchResult }
  | { type: "SET_USER_LOCATION"; location: SearchResult | null }
  | { type: "CLEAR_LOCATION" }
  | { type: "SET_LOCATION_FOCUSED"; focused: boolean }
  | { type: "SET_ERROR"; error: string }
  | { type: "SET_EXPORT_STATUS"; exporting: boolean; error?: string }
  | { type: "SET_MARKER_EDITOR_ACTIVE"; active: boolean }
  | { type: "SET_ACTIVE_MARKER"; markerId: string | null }
  | { type: "ADD_MARKER"; marker: MarkerItem }
  | { type: "UPDATE_MARKER"; markerId: string; changes: Partial<MarkerItem> }
  | { type: "REMOVE_MARKER"; markerId: string }
  | { type: "CLEAR_MARKERS" }
  | { type: "ADD_CUSTOM_MARKER_ICON"; icon: MarkerIconDefinition }
  | { type: "SET_CUSTOM_MARKER_ICONS"; icons: MarkerIconDefinition[] }
  | { type: "REMOVE_CUSTOM_MARKER_ICON"; iconId: string }
  | { type: "CLEAR_CUSTOM_MARKER_ICONS" }
  | {
      type: "SET_MARKER_DEFAULTS";
      defaults: Partial<MarkerDefaults>;
      applyToMarkers?: boolean;
    }
  | { type: "RESET_MARKER_DEFAULTS" }
  | { type: "ADD_ROUTE"; route: Route }
  | { type: "UPDATE_ROUTE"; routeId: string; changes: Partial<Route> }
  | { type: "REMOVE_ROUTE"; routeId: string }
  | { type: "REPLACE_ROUTES"; routes: Route[] }
  | { type: "CLEAR_ROUTES" }
  | {
      type: "SET_ROUTE_DEFAULTS";
      defaults: Partial<RouteDefaults>;
      applyToRoutes?: boolean;
    };

/* ────── Reducer ────── */

export function posterReducer(
  state: PosterState,
  action: PosterAction,
): PosterState {
  switch (action.type) {
    case "SET_FIELD": {
      const nextForm = { ...state.form, [action.name]: action.value };
      const nextDisplayNameOverrides = { ...state.displayNameOverrides };

      if (action.name === "location" && typeof action.value === "string") {
        nextDisplayNameOverrides.city = false;
        nextDisplayNameOverrides.country = false;
      }

      if (action.name === "latitude" || action.name === "longitude") {
        nextDisplayNameOverrides.city = false;
        nextDisplayNameOverrides.country = false;
      }

      if (action.name === "displayCity") {
        nextDisplayNameOverrides.city = true;
      }

      if (action.name === "displayCountry") {
        nextDisplayNameOverrides.country = true;
      }

      return {
        ...state,
        form: nextForm,
        displayNameOverrides: nextDisplayNameOverrides,
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
        displayNameOverrides: action.resetDisplayNameOverrides
          ? { city: false, country: false }
          : state.displayNameOverrides,
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

    case "SET_CUSTOM_COLORS":
      return { ...state, customColors: { ...action.colors } };

    case "RESET_COLORS":
      return { ...state, customColors: {} };

    case "SET_SAVED_THEMES":
      return { ...state, savedThemes: action.themes };

    case "ADD_SAVED_THEME":
      return { ...state, savedThemes: [...state.savedThemes, action.theme] };

    case "UPDATE_SAVED_THEME":
      return {
        ...state,
        savedThemes: state.savedThemes.map((t) =>
          t.id === action.themeId
            ? { ...t, ...action.changes, id: t.id }
            : t,
        ),
      };

    case "REMOVE_SAVED_THEME": {
      const nextSaved = state.savedThemes.filter(
        (t) => t.id !== action.themeId,
      );
      // If user is currently on the deleted saved theme, reducer leaves
      // form.theme alone — caller decides whether to switch themes.
      return { ...state, savedThemes: nextSaved };
    }

    case "SELECT_LOCATION":
      return {
        ...state,
        selectedLocation: action.location,
        isLocationFocused: false,
        displayNameOverrides: { city: false, country: false },
        form: {
          ...state.form,
          location: action.location.label,
          latitude: action.location.lat.toFixed(6),
          longitude: action.location.lon.toFixed(6),
          displayCity: action.location.city,
          displayCountry: action.location.country,
          displayContinent: action.location.continent || "",
        },
      };

    case "SET_USER_LOCATION":
      return {
        ...state,
        userLocation: action.location,
      };

    case "CLEAR_LOCATION":
      return {
        ...state,
        selectedLocation: null,
        displayNameOverrides: { city: false, country: false },
        form: {
          ...state.form,
          location: "",
          displayCity: "",
          displayCountry: "",
          displayContinent: "",
        },
      };

    case "SET_LOCATION_FOCUSED":
      return { ...state, isLocationFocused: action.focused };

    case "SET_ERROR":
      return { ...state, error: action.error };

    case "SET_EXPORT_STATUS":
      return {
        ...state,
        isExporting: action.exporting,
        error: action.exporting ? "" : (action.error ?? state.error),
      };

    case "SET_MARKER_EDITOR_ACTIVE":
      return {
        ...state,
        isMarkerEditorActive: action.active,
        activeMarkerId: action.active ? state.activeMarkerId : null,
      };

    case "SET_ACTIVE_MARKER":
      return {
        ...state,
        activeMarkerId: action.markerId,
      };

    case "ADD_MARKER":
      return {
        ...state,
        markers: [...state.markers, action.marker],
      };

    case "UPDATE_MARKER":
      return {
        ...state,
        markers: state.markers.map((marker) =>
          marker.id === action.markerId
            ? {
                ...marker,
                ...action.changes,
                id: marker.id,
                size:
                  typeof action.changes.size === "number"
                    ? clamp(action.changes.size, MIN_MARKER_SIZE, MAX_MARKER_SIZE)
                    : marker.size,
              }
            : marker,
        ),
      };

    case "REMOVE_MARKER":
      return {
        ...state,
        markers: state.markers.filter((marker) => marker.id !== action.markerId),
        activeMarkerId:
          state.activeMarkerId === action.markerId ? null : state.activeMarkerId,
      };

    case "CLEAR_MARKERS":
      return {
        ...state,
        markers: [],
        activeMarkerId: null,
        isMarkerEditorActive: false,
      };

    case "ADD_CUSTOM_MARKER_ICON":
      return {
        ...state,
        customMarkerIcons: [...state.customMarkerIcons, action.icon],
      };

    case "SET_CUSTOM_MARKER_ICONS":
      return {
        ...state,
        customMarkerIcons: action.icons,
      };

    case "REMOVE_CUSTOM_MARKER_ICON": {
      const fallbackIconId = featuredMarkerIcons[0]?.id ?? state.markers[0]?.iconId ?? "pin";
      return {
        ...state,
        customMarkerIcons: state.customMarkerIcons.filter(
          (icon) => icon.id !== action.iconId,
        ),
        markers: state.markers.map((marker) =>
          marker.iconId === action.iconId
            ? { ...marker, iconId: fallbackIconId }
            : marker,
        ),
      };
    }

    case "CLEAR_CUSTOM_MARKER_ICONS": {
      const fallbackIconId = featuredMarkerIcons[0]?.id ?? state.markers[0]?.iconId ?? "pin";
      const customIconIdSet = new Set(state.customMarkerIcons.map((icon) => icon.id));
      return {
        ...state,
        customMarkerIcons: [],
        markers: state.markers.map((marker) =>
          customIconIdSet.has(marker.iconId)
            ? { ...marker, iconId: fallbackIconId }
            : marker,
        ),
      };
    }

    case "SET_MARKER_DEFAULTS": {
      const hasSizeUpdate =
        typeof action.defaults.size === "number" &&
        Number.isFinite(action.defaults.size);
      const hasColorUpdate =
        typeof action.defaults.color === "string" &&
        action.defaults.color.trim().length > 0;
      const nextDefaults = {
        ...state.markerDefaults,
        ...(hasSizeUpdate
          ? {
              size: clamp(
                Number(action.defaults.size),
                MIN_MARKER_SIZE,
                MAX_MARKER_SIZE,
              ),
            }
          : {}),
        ...(hasColorUpdate ? { color: String(action.defaults.color) } : {}),
      };

      return {
        ...state,
        markerDefaults: nextDefaults,
        markers: action.applyToMarkers
          ? state.markers.map((marker) => ({
              ...marker,
              ...(hasSizeUpdate ? { size: nextDefaults.size } : {}),
              ...(hasColorUpdate ? { color: nextDefaults.color } : {}),
            }))
          : state.markers,
      };
    }

    case "RESET_MARKER_DEFAULTS": {
      const defaults = createDefaultMarkerSettings();
      return {
        ...state,
        markerDefaults: defaults,
        markers: state.markers.map((marker) => ({
          ...marker,
          size: defaults.size,
          color: defaults.color,
        })),
      };
    }

    case "ADD_ROUTE":
      return {
        ...state,
        routes: [...state.routes, action.route],
      };

    case "UPDATE_ROUTE":
      return {
        ...state,
        routes: state.routes.map((route) =>
          route.id === action.routeId
            ? {
                ...route,
                ...action.changes,
                id: route.id,
                segments: route.segments,
                strokeWidth:
                  typeof action.changes.strokeWidth === "number"
                    ? clamp(
                        action.changes.strokeWidth,
                        MIN_ROUTE_STROKE_WIDTH,
                        MAX_ROUTE_STROKE_WIDTH,
                      )
                    : route.strokeWidth,
                opacity:
                  typeof action.changes.opacity === "number"
                    ? clamp(
                        action.changes.opacity,
                        MIN_ROUTE_OPACITY,
                        MAX_ROUTE_OPACITY,
                      )
                    : route.opacity,
              }
            : route,
        ),
      };

    case "REMOVE_ROUTE":
      return {
        ...state,
        routes: state.routes.filter((route) => route.id !== action.routeId),
      };

    case "REPLACE_ROUTES":
      return { ...state, routes: action.routes };

    case "CLEAR_ROUTES":
      return { ...state, routes: [] };

    case "SET_ROUTE_DEFAULTS": {
      const { defaults: partial } = action;
      const nextDefaults: RouteDefaults = {
        color: partial.color ?? state.routeDefaults.color,
        strokeWidth:
          typeof partial.strokeWidth === "number"
            ? clamp(
                partial.strokeWidth,
                MIN_ROUTE_STROKE_WIDTH,
                MAX_ROUTE_STROKE_WIDTH,
              )
            : state.routeDefaults.strokeWidth,
        opacity:
          typeof partial.opacity === "number"
            ? clamp(partial.opacity, MIN_ROUTE_OPACITY, MAX_ROUTE_OPACITY)
            : state.routeDefaults.opacity,
        lineStyle: partial.lineStyle ?? state.routeDefaults.lineStyle,
        startIconId: partial.startIconId ?? state.routeDefaults.startIconId,
        finishIconId: partial.finishIconId ?? state.routeDefaults.finishIconId,
      };

      return {
        ...state,
        routeDefaults: nextDefaults,
        routes: action.applyToRoutes
          ? state.routes.map((route) => ({
              ...route,
              color: nextDefaults.color,
              strokeWidth: nextDefaults.strokeWidth,
              opacity: nextDefaults.opacity,
              lineStyle: nextDefaults.lineStyle,
            }))
          : state.routes,
      };
    }

    default:
      return state;
  }
}
