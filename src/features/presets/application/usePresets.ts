import { useCallback, useEffect, useState } from "react";
import { usePosterContext } from "@/features/poster/ui/PosterContext";
import type { PosterPreset } from "@/features/presets/domain/types";
import {
  loadPresets,
  savePreset,
  deletePreset,
} from "@/features/presets/infrastructure/presetStorage";

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function usePresets() {
  const { state, dispatch } = usePosterContext();
  const [presets, setPresets] = useState<PosterPreset[]>([]);

  useEffect(() => {
    setPresets(loadPresets());
  }, []);

  const handleSavePreset = useCallback(
    (name: string) => {
      const preset: PosterPreset = {
        id: generateId(),
        name: name.trim() || "Untitled",
        createdAt: Date.now(),
        form: { ...state.form },
        customColors: { ...state.customColors },
      };
      setPresets(savePreset(preset));
    },
    [state.form, state.customColors],
  );

  const handleLoadPreset = useCallback(
    (preset: PosterPreset) => {
      dispatch({ type: "SET_THEME", themeId: preset.form.theme });
      dispatch({ type: "SET_FORM_FIELDS", fields: preset.form });
      for (const [key, value] of Object.entries(preset.customColors)) {
        dispatch({ type: "SET_COLOR", key, value });
      }
    },
    [dispatch],
  );

  const handleDeletePreset = useCallback((id: string) => {
    setPresets(deletePreset(id));
  }, []);

  return {
    presets,
    handleSavePreset,
    handleLoadPreset,
    handleDeletePreset,
  };
}
