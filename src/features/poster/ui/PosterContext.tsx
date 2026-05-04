import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import {
  posterReducer,
  type PosterState,
  type PosterAction,
  type PosterForm,
} from "../application/posterReducer";
import type { ResolvedTheme } from "@/features/theme/domain/types";
import { getTheme } from "@/features/theme/infrastructure/themeRepository";
import { applyThemeColorOverrides } from "@/features/theme/domain/colorPaths";
import { generateMapStyle } from "@/features/map/infrastructure/maplibreStyle";
import { useGeolocation } from "@/features/map/application/useGeolocation";
import type { StyleSpecification } from "maplibre-gl";
import type { MapInstanceRef } from "@/features/map/domain/types";
import { createDefaultMarkerSettings } from "@/features/markers/infrastructure/helpers";
import {
  loadCustomMarkerIcons,
  saveCustomMarkerIcons,
} from "@/features/markers/infrastructure/customIconStorage";
import { createDefaultRouteSettings } from "@/features/routes/infrastructure/helpers";
import {
  loadSavedThemes,
  saveSavedThemes,
} from "@/features/theme/infrastructure/savedThemesStorage";
import {
  loadUserDefaults,
  saveUserDefaults,
} from "@/features/settings/infrastructure/userDefaultsStorage";
import type { UserDefaults } from "@/features/settings/domain/types";

/* ────── Default form (moved from appConfig) ────── */

import {
  defaultLayoutId,
  getLayoutOption,
} from "@/features/layout/infrastructure/layoutRepository";
import { formatLayoutCm } from "@/features/layout/domain/layoutMatcher";
import { defaultThemeName } from "@/features/theme/infrastructure/themeRepository";
import {
  DEFAULT_POSTER_WIDTH_CM,
  DEFAULT_POSTER_HEIGHT_CM,
  DEFAULT_DISTANCE_METERS,
  DEFAULT_LAT,
  DEFAULT_LON,
} from "@/core/config";

const defaultLayoutOption = getLayoutOption(defaultLayoutId);
const defaultLayoutWidthCm = Number(
  defaultLayoutOption?.widthCm ?? DEFAULT_POSTER_WIDTH_CM,
);
const defaultLayoutHeightCm = Number(
  defaultLayoutOption?.heightCm ?? DEFAULT_POSTER_HEIGHT_CM,
);
const DEFAULT_LOCATION_LABEL =
  "Hanover, Region Hannover, Lower Saxony, Germany";

export const DEFAULT_FORM: PosterForm = {
  location: DEFAULT_LOCATION_LABEL,
  latitude: DEFAULT_LAT.toFixed(6),
  longitude: DEFAULT_LON.toFixed(6),
  distance: String(DEFAULT_DISTANCE_METERS),
  width: String(defaultLayoutWidthCm),
  height: String(defaultLayoutHeightCm),
  theme: defaultThemeName,
  layout: defaultLayoutId,
  displayCity: "Hanover",
  displayCountry: "Germany",
  displayContinent: "Europe",
  fontFamily: "",
  showPosterText: true,
  includeCredits: true,
  includeLandcover: true,
  includeBuildings: false,
  includeWater: true,
  includeParks: true,
  includeAeroway: true,
  includeRail: true,
  includeRoads: true,
  includeRoadPath: true,
  includeRoadMinorLow: true,
  includeRoadOutline: true,
  showMarkers: true,
  showRoutes: true,
};

function applyUserDefaultsToForm(
  baseForm: PosterForm,
  defaults: UserDefaults,
): PosterForm {
  const next: PosterForm = { ...baseForm };
  if (defaults.theme) next.theme = defaults.theme;
  if (defaults.layout) {
    next.layout = defaults.layout;
    // Width/height aren't saved separately — derive from the layout option so
    // a saved "linkedin_cover" actually loads with LinkedIn dimensions.
    const layoutOption = getLayoutOption(defaults.layout);
    if (layoutOption) {
      next.width = formatLayoutCm(layoutOption.widthCm);
      next.height = formatLayoutCm(layoutOption.heightCm);
    }
  }
  if (defaults.fontFamily !== undefined) next.fontFamily = defaults.fontFamily;
  return next;
}

function buildInitialState(): PosterState {
  const userDefaults = loadUserDefaults();
  return {
    form: applyUserDefaultsToForm(DEFAULT_FORM, userDefaults),
    customColors: {},
    savedThemes: [],
    userDefaults,
    markers: [],
    customMarkerIcons: [],
    markerDefaults: {
      ...createDefaultMarkerSettings(),
      color: getTheme(defaultThemeName).ui.text,
    },
    isMarkerEditorActive: false,
    activeMarkerId: null,
    routes: [],
    routeDefaults: {
      ...createDefaultRouteSettings(),
      color: getTheme(defaultThemeName).ui.text,
    },
    error: "",
    isExporting: false,
    isLocationFocused: false,
    selectedLocation: null,
    userLocation: null,
    displayNameOverrides: {
      city: false,
      country: false,
    },
  };
}

/* ────── Context shapes ────── */

interface PosterDispatchContextValue {
  dispatch: React.Dispatch<PosterAction>;
}

const PosterDispatchContext = createContext<PosterDispatchContextValue | null>(null);

interface PosterContextValue {
  state: PosterState;
  dispatch: React.Dispatch<PosterAction>;
  selectedTheme: ResolvedTheme;
  effectiveTheme: ResolvedTheme;
  mapStyle: StyleSpecification;
  mapRef: MapInstanceRef;
}

const PosterContext = createContext<PosterContextValue | null>(null);

/* ────── Provider ────── */

export function PosterProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(
    posterReducer,
    undefined,
    buildInitialState,
  );
  const mapRef = useRef(null) as MapInstanceRef;
  const lastSyncedMarkerThemeColorRef = useRef<string | null>(null);
  const lastSyncedRouteThemeColorRef = useRef<string | null>(null);
  const hasLoadedCustomIconsRef = useRef(false);
  const hasLoadedSavedThemesRef = useRef(false);
  const initialUserDefaultsRef = useRef(state.userDefaults);

  useGeolocation(dispatch);

  const selectedTheme = useMemo(() => {
    const saved = state.savedThemes.find((t) => t.id === state.form.theme);
    if (saved) {
      return {
        name: saved.name,
        description: "Saved theme",
        ui: { ...saved.colors.ui },
        map: {
          ...saved.colors.map,
          roads: { ...saved.colors.map.roads },
        },
      };
    }
    return getTheme(state.form.theme);
  }, [state.form.theme, state.savedThemes]);

  const effectiveTheme = useMemo(() => {
    if (Object.keys(state.customColors).length === 0) {
      return selectedTheme;
    }
    return applyThemeColorOverrides(selectedTheme, state.customColors);
  }, [selectedTheme, state.customColors]);

  useEffect(() => {
    const markerThemeColor = effectiveTheme.ui.text;
    const previouslySynced = lastSyncedMarkerThemeColorRef.current;

    if (previouslySynced === markerThemeColor) {
      return;
    }

    lastSyncedMarkerThemeColorRef.current = markerThemeColor;
    dispatch({
      type: "SET_MARKER_DEFAULTS",
      defaults: { color: markerThemeColor },
      applyToMarkers: true,
    });
  }, [dispatch, effectiveTheme.ui.text]);

  useEffect(() => {
    const routeThemeColor = effectiveTheme.ui.text;
    if (lastSyncedRouteThemeColorRef.current === routeThemeColor) {
      return;
    }
    lastSyncedRouteThemeColorRef.current = routeThemeColor;
    dispatch({
      type: "SET_ROUTE_DEFAULTS",
      defaults: { color: routeThemeColor },
      applyToRoutes: true,
    });
  }, [dispatch, effectiveTheme.ui.text]);

  useEffect(() => {
    let isCancelled = false;

    void loadCustomMarkerIcons()
      .then((icons) => {
        if (isCancelled) {
          return;
        }
        hasLoadedCustomIconsRef.current = true;
        dispatch({ type: "SET_CUSTOM_MARKER_ICONS", icons });
      })
      .catch(() => {
        hasLoadedCustomIconsRef.current = true;
        // Ignore storage read failures.
      });

    return () => {
      isCancelled = true;
    };
  }, [dispatch]);

  useEffect(() => {
    if (!hasLoadedCustomIconsRef.current) {
      return;
    }
    void saveCustomMarkerIcons(state.customMarkerIcons).catch(() => {
      // Ignore storage write failures.
    });
  }, [state.customMarkerIcons]);

  useEffect(() => {
    const saved = loadSavedThemes();
    hasLoadedSavedThemesRef.current = true;
    if (saved.length > 0) {
      dispatch({ type: "SET_SAVED_THEMES", themes: saved });
    }
  }, []);

  useEffect(() => {
    if (!hasLoadedSavedThemesRef.current) return;
    saveSavedThemes(state.savedThemes);
  }, [state.savedThemes]);

  useEffect(() => {
    if (state.userDefaults === initialUserDefaultsRef.current) return;
    saveUserDefaults(state.userDefaults);
  }, [state.userDefaults]);

  const mapStyle = useMemo(
    () =>
      generateMapStyle(effectiveTheme, {
        includeLandcover: state.form.includeLandcover,
        includeBuildings: state.form.includeBuildings,
        includeWater: state.form.includeWater,
        includeParks: state.form.includeParks,
        includeAeroway: state.form.includeAeroway,
        includeRail: state.form.includeRail,
        includeRoads: state.form.includeRoads,
        includeRoadPath: state.form.includeRoadPath,
        includeRoadMinorLow: state.form.includeRoadMinorLow,
        includeRoadOutline: state.form.includeRoadOutline,
        distanceMeters: Number(state.form.distance),
      }),
    [
      effectiveTheme,
      state.form.includeLandcover,
      state.form.includeBuildings,
      state.form.includeWater,
      state.form.includeParks,
      state.form.includeAeroway,
      state.form.includeRail,
      state.form.includeRoads,
      state.form.includeRoadPath,
      state.form.includeRoadMinorLow,
      state.form.includeRoadOutline,
      state.form.distance,
    ],
  );

  const dispatchValue = useMemo<PosterDispatchContextValue>(
    () => ({ dispatch }),
    [dispatch],
  );

  const value = useMemo<PosterContextValue>(
    () => ({
      state,
      dispatch,
      selectedTheme,
      effectiveTheme,
      mapStyle,
      mapRef,
    }),
    [state, selectedTheme, effectiveTheme, mapStyle],
  );

  return (
    <PosterDispatchContext.Provider value={dispatchValue}>
      <PosterContext.Provider value={value}>{children}</PosterContext.Provider>
    </PosterDispatchContext.Provider>
  );
}

/* ────── Hook ────── */

export function usePosterContext(): PosterContextValue {
  const ctx = useContext(PosterContext);
  if (!ctx) {
    throw new Error("usePosterContext must be used within a PosterProvider");
  }
  return ctx;
}

export function usePosterDispatch(): PosterDispatchContextValue {
  const ctx = useContext(PosterDispatchContext);
  if (!ctx) {
    throw new Error("usePosterDispatch must be used within a PosterProvider");
  }
  return ctx;
}
