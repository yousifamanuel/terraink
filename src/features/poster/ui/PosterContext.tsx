import {
  createContext,
  useContext,
  useReducer,
  useMemo,
  useRef,
  type ReactNode,
  type RefObject,
} from "react";
import {
  posterReducer,
  type PosterState,
  type PosterAction,
  type PosterForm,
} from "../application/posterReducer";
import type { ResolvedTheme } from "@/features/theme/domain/types";
import type { RenderCache } from "../domain/types";
import { getTheme } from "@/features/theme/infrastructure/themeRepository";

/* ────── Default form (moved from appConfig) ────── */

import {
  defaultLayoutId,
  getLayoutOption,
} from "@/features/layout/infrastructure/layoutRepository";
import { defaultThemeName } from "@/features/theme/infrastructure/themeRepository";
import {
  DEFAULT_POSTER_WIDTH_CM,
  DEFAULT_POSTER_HEIGHT_CM,
  DEFAULT_DISTANCE_METERS,
} from "@/core/config";

const defaultLayoutOption = getLayoutOption(defaultLayoutId);
const defaultLayoutWidthCm = Number(
  defaultLayoutOption?.widthCm ?? DEFAULT_POSTER_WIDTH_CM,
);
const defaultLayoutHeightCm = Number(
  defaultLayoutOption?.heightCm ?? DEFAULT_POSTER_HEIGHT_CM,
);

export const DEFAULT_FORM: PosterForm = {
  location: "",
  latitude: "",
  longitude: "",
  distance: String(DEFAULT_DISTANCE_METERS),
  width: String(defaultLayoutWidthCm),
  height: String(defaultLayoutHeightCm),
  theme: defaultThemeName,
  layout: defaultLayoutId,
  displayCity: "",
  displayCountry: "",
  fontFamily: "",
  showPosterText: true,
};

const INITIAL_STATE: PosterState = {
  form: DEFAULT_FORM,
  customColors: {},
  status: "",
  error: "",
  isGenerating: false,
  generationProgress: 0,
  result: null,
  isLocationFocused: false,
  selectedLocation: null,
};

/* ────── Context shape ────── */

interface PosterContextValue {
  state: PosterState;
  dispatch: React.Dispatch<PosterAction>;
  selectedTheme: ResolvedTheme;
  effectiveTheme: ResolvedTheme;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  renderCacheRef: RefObject<RenderCache | null>;
}

const PosterContext = createContext<PosterContextValue | null>(null);

/* ────── Provider ────── */

export function PosterProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(posterReducer, INITIAL_STATE);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const renderCacheRef = useRef<RenderCache | null>(null);

  const selectedTheme = useMemo(
    () => getTheme(state.form.theme),
    [state.form.theme],
  );

  const effectiveTheme = useMemo(() => {
    if (Object.keys(state.customColors).length === 0) {
      return selectedTheme;
    }
    return { ...selectedTheme, ...state.customColors } as ResolvedTheme;
  }, [selectedTheme, state.customColors]);

  const value = useMemo<PosterContextValue>(
    () => ({
      state,
      dispatch,
      selectedTheme,
      effectiveTheme,
      canvasRef,
      renderCacheRef,
    }),
    [state, selectedTheme, effectiveTheme],
  );

  return (
    <PosterContext.Provider value={value}>{children}</PosterContext.Provider>
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
