import type { RefObject } from "react";
import ThemeCard from "./ThemeCard";
import { EditIcon } from "@/shared/ui/Icons";
import {
  DISPLAY_PALETTE_KEYS,
  type SavedTheme,
  type ThemeOption,
} from "../domain/types";
import { getThemeColorByPath } from "../domain/colorPaths";
import AdUnit from "@/shared/ui/AdUnit";
import { AD_SLOT_INFEED } from "@/core/config";

const AD_AFTER_NTH_CARD = 4;

interface ThemeSummarySectionProps {
  listRef?: RefObject<HTMLDivElement>;
  themeOptions: ThemeOption[];
  selectedThemeId: string;
  selectedThemeOption: ThemeOption;
  onThemeSelect: (themeId: string) => void;
  onCustomize: () => void;
  savedThemes: SavedTheme[];
  onApplySavedTheme: (themeId: string) => void;
  onDeleteSavedTheme: (themeId: string) => void;
}

function savedThemeToOption(saved: SavedTheme): ThemeOption {
  const palette = DISPLAY_PALETTE_KEYS.map(
    (key) => getThemeColorByPath(saved.colors, key) || "",
  );
  return {
    id: saved.id,
    name: saved.name,
    description: saved.description,
    palette,
  };
}

export default function ThemeSummarySection({
  listRef,
  themeOptions,
  selectedThemeId,
  selectedThemeOption,
  onThemeSelect,
  onCustomize,
  savedThemes,
  onApplySavedTheme,
  onDeleteSavedTheme,
}: ThemeSummarySectionProps) {
  const description =
    selectedThemeOption.description?.trim() || "No description available.";

  return (
    <div className="theme-summary-view">
      <div className="theme-summary-head">
        <div className="theme-summary-copy">
          <p className="theme-summary-label">
            Theme: <span className="theme-summary-label-name">{selectedThemeOption.name}</span>
          </p>
          <p className="theme-card-description">{description}</p>
        </div>
        <button
          type="button"
          className="theme-customize-btn"
          onClick={onCustomize}
          aria-label={`Customize ${selectedThemeOption.name} colors`}
        >
          <span className="theme-customize-icon" aria-hidden="true">
            <EditIcon />
          </span>
        </button>
      </div>

      <section className="theme-section theme-section--saved">
        <h3 className="theme-section-heading">Saved Themes</h3>
        {savedThemes.length === 0 ? (
          <div className="saved-themes-empty" role="status">
            <p className="saved-themes-empty-text">
              Customize and save a theme to see it here.
            </p>
          </div>
        ) : (
          <div
            className="theme-card-list card-scroll-list saved-themes-list"
            role="list"
            aria-label="Saved themes"
          >
            {savedThemes.map((saved) => (
              <ThemeCard
                key={saved.id}
                themeOption={savedThemeToOption(saved)}
                isSelected={saved.id === selectedThemeId}
                onClick={() => onApplySavedTheme(saved.id)}
                onDelete={() => onDeleteSavedTheme(saved.id)}
                deleteAriaLabel={`Delete saved theme ${saved.name}`}
              />
            ))}
          </div>
        )}
      </section>

      <section className="theme-section theme-section--builtin">
        <h3 className="theme-section-heading">Built-in Themes</h3>
        <div
          className="theme-card-list card-scroll-list"
          role="list"
          aria-label="Theme options"
          ref={listRef}
        >
          {themeOptions.flatMap((themeOption, i) => {
            const card = (
              <ThemeCard
                key={themeOption.id}
                themeOption={themeOption}
                isSelected={themeOption.id === selectedThemeId}
                onClick={() => onThemeSelect(themeOption.id)}
              />
            );
            if ((i + 1) % AD_AFTER_NTH_CARD === 0) {
              return [
                card,
                <AdUnit key={`ad-theme-${i}`} slot={AD_SLOT_INFEED} format="rectangle" />,
              ];
            }
            return [card];
          })}
        </div>
      </section>
    </div>
  );
}
