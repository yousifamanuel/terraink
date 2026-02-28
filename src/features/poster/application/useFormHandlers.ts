import { useCallback } from "react";
import { usePosterContext } from "../ui/PosterContext";
import { clamp } from "@/shared/geo/math";
import {
  normalizePosterSizeValue,
  resolveLayoutIdForSize,
} from "@/features/layout/domain/layoutMatcher";
import { formatLayoutCm } from "@/features/layout/domain/layoutMatcher";
import {
  getLayoutOption,
  layoutOptions,
} from "@/features/layout/infrastructure/layoutRepository";
import {
  MIN_POSTER_CM,
  MAX_POSTER_CM,
  MIN_DISTANCE_METERS,
  MAX_DISTANCE_METERS,
  LAYOUT_MATCH_TOLERANCE_CM,
} from "@/core/config";

/**
 * Provides ready-made event handlers for the settings form,
 * replacing the inline handlers previously in App.jsx.
 */
export function useFormHandlers() {
  const { state, dispatch } = usePosterContext();

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const target = event.target as HTMLInputElement;
      const { name, value, type } = target;
      const checked = "checked" in target ? target.checked : false;

      if (name === "showPosterText" && type === "checkbox") {
        dispatch({ type: "SET_FIELD", name, value: checked });
        return;
      }

      let fieldValue: string | boolean = value as string;

      if (name === "includeCredits" && type === "checkbox") {
        fieldValue = checked;
      }

      dispatch({ type: "SET_FIELD", name, value: fieldValue });
    },
    [dispatch],
  );

  const handleNumericFieldBlur = useCallback(
    (event: React.FocusEvent<HTMLInputElement>) => {
      const { name, value } = event.target;
      const trimmed = String(value ?? "").trim();
      if (!trimmed) return;

      const parsed = Number(trimmed);
      if (!Number.isFinite(parsed)) return;

      if (name === "distance") {
        dispatch({
          type: "SET_FIELD",
          name: "distance",
          value: String(
            Math.round(clamp(parsed, MIN_DISTANCE_METERS, MAX_DISTANCE_METERS)),
          ),
        });
        return;
      }

      if (name === "width" || name === "height") {
        const normalizedChangedValue = clamp(
          parsed,
          MIN_POSTER_CM,
          MAX_POSTER_CM,
        );

        const prevWidth =
          name === "width" ? normalizedChangedValue : Number(state.form.width);
        const prevHeight =
          name === "height"
            ? normalizedChangedValue
            : Number(state.form.height);

        const nextWidth = normalizePosterSizeValue(
          prevWidth,
          normalizedChangedValue,
          MIN_POSTER_CM,
          MAX_POSTER_CM,
        );
        const nextHeight = normalizePosterSizeValue(
          prevHeight,
          normalizedChangedValue,
          MIN_POSTER_CM,
          MAX_POSTER_CM,
        );

        dispatch({
          type: "SET_FORM_FIELDS",
          fields: {
            width: formatLayoutCm(nextWidth),
            height: formatLayoutCm(nextHeight),
            layout: resolveLayoutIdForSize(
              nextWidth,
              nextHeight,
              state.form.layout,
              LAYOUT_MATCH_TOLERANCE_CM,
              getLayoutOption(state.form.layout),
              layoutOptions,
            ),
          },
        });
      }
    },
    [dispatch, state.form.width, state.form.height, state.form.layout],
  );

  const handleThemeChange = useCallback(
    (themeId: string) => {
      dispatch({ type: "SET_THEME", themeId });
    },
    [dispatch],
  );

  const handleLayoutChange = useCallback(
    (layoutId: string) => {
      const layoutOption = getLayoutOption(layoutId);
      if (!layoutOption) return;

      dispatch({
        type: "SET_LAYOUT",
        layoutId: layoutOption.id,
        widthCm: formatLayoutCm(layoutOption.widthCm),
        heightCm: formatLayoutCm(layoutOption.heightCm),
      });
    },
    [dispatch],
  );

  const handleColorChange = useCallback(
    (key: string, value: string) => {
      dispatch({ type: "SET_COLOR", key, value });
    },
    [dispatch],
  );

  const handleResetColors = useCallback(() => {
    dispatch({ type: "RESET_COLORS" });
  }, [dispatch]);

  const handleLocationSelect = useCallback(
    (suggestion: {
      label: string;
      lat: number;
      lon: number;
      city: string;
      country: string;
      id: string;
    }) => {
      dispatch({ type: "SELECT_LOCATION", location: suggestion });
    },
    [dispatch],
  );

  const handleClearLocation = useCallback(() => {
    dispatch({ type: "CLEAR_LOCATION" });
  }, [dispatch]);

  const setLocationFocused = useCallback(
    (focused: boolean) => {
      dispatch({ type: "SET_LOCATION_FOCUSED", focused });
    },
    [dispatch],
  );

  const handleCreditsChange = useCallback(
    (value: boolean) => {
      dispatch({ type: "SET_FIELD", name: "includeCredits", value });
    },
    [dispatch],
  );

  return {
    handleChange,
    handleNumericFieldBlur,
    handleThemeChange,
    handleLayoutChange,
    handleColorChange,
    handleResetColors,
    handleLocationSelect,
    handleClearLocation,
    setLocationFocused,
    handleCreditsChange,
  };
}
