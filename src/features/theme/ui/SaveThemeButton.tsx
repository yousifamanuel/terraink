import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import SaveChoiceModal from "./SaveChoiceModal";
import SaveThemeModal from "./SaveThemeModal";
import type { SavedTheme, ThemeColors } from "../domain/types";

export interface SaveThemeFlowOptions {
  /** Name and description of the theme being changed (for suggestions). */
  themeName: string;
  themeDescription: string;
  /** The colors to store, exactly as the poster shows them now. */
  colors: ThemeColors;
  /** The theme in use; if it is a saved one, the user may overwrite it. */
  currentThemeId: string;
  savedThemes: SavedTheme[];
  onAddSavedTheme: (theme: SavedTheme) => void;
  onUpdateSavedTheme: (themeId: string, changes: Partial<SavedTheme>) => void;
  onThemeChange: (themeId: string) => void;
  /** Clears the edits that are now part of the saved theme. */
  onSaved: () => void;
}

function snapshot(colors: ThemeColors): ThemeColors {
  return {
    ui: { ...colors.ui },
    map: { ...colors.map, roads: { ...colors.map.roads } },
  };
}

function suggestName(baseName: string): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const stamp =
    `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}` +
    `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  return `${baseName}-${stamp}`;
}

/**
 * Saving the current colors as a theme: asks "overwrite or copy" on a saved
 * theme, then for a name. Returns `open` and the windows to render.
 */
export function useSaveThemeFlow(options: SaveThemeFlowOptions): {
  open: () => void;
  modals: ReactNode;
} {
  const { t } = useTranslation();
  const [isChoiceOpen, setIsChoiceOpen] = useState(false);
  const [isNameOpen, setIsNameOpen] = useState(false);
  const isOnSavedTheme = options.savedThemes.some(
    (theme) => theme.id === options.currentThemeId,
  );

  const open = () => (isOnSavedTheme ? setIsChoiceOpen(true) : setIsNameOpen(true));

  const overwrite = () => {
    options.onUpdateSavedTheme(options.currentThemeId, {
      colors: snapshot(options.colors),
      savedAt: new Date().toISOString(),
    });
    options.onSaved();
    setIsChoiceOpen(false);
  };

  const saveNew = (name: string, description: string) => {
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? `saved-${crypto.randomUUID()}`
        : `saved-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    options.onAddSavedTheme({
      id,
      name,
      description,
      colors: snapshot(options.colors),
      savedAt: new Date().toISOString(),
    });
    // Show the new theme, so the poster keeps what was just saved.
    options.onThemeChange(id);
    options.onSaved();
    setIsNameOpen(false);
  };

  const modals = (
    <>
      {isChoiceOpen ? (
        <SaveChoiceModal
          themeName={options.themeName}
          onSave={overwrite}
          onSaveAsCopy={() => {
            setIsChoiceOpen(false);
            setIsNameOpen(true);
          }}
          onCancel={() => setIsChoiceOpen(false)}
        />
      ) : null}
      {isNameOpen ? (
        <SaveThemeModal
          suggestedName={suggestName(
            options.themeName.trim() || t("map.settings.themeFallbackName"),
          )}
          suggestedDescription={options.themeDescription}
          existingNames={options.savedThemes.map((theme) => theme.name)}
          onConfirm={saveNew}
          onCancel={() => setIsNameOpen(false)}
        />
      ) : null}
    </>
  );

  return { open, modals };
}

interface SaveThemeButtonProps extends SaveThemeFlowOptions {
  disabled?: boolean;
  className?: string;
}

/** The theme Save button with its save windows. */
export default function SaveThemeButton({
  disabled = false,
  className = "",
  ...options
}: SaveThemeButtonProps) {
  const { t } = useTranslation();
  const { open, modals } = useSaveThemeFlow(options);
  return (
    <>
      <button
        type="button"
        className={`theme-save-btn ${className}`.trim()}
        onClick={open}
        disabled={disabled}
      >
        {t("theme.editor.save")}
      </button>
      {modals}
    </>
  );
}
