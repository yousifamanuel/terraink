import type { RefObject } from "react";
import { useTranslation } from "react-i18next";
import { getThemeDescription } from "@/features/theme/application/themeDescription";
import ThemeCard from "./ThemeCard";
import { EditIcon } from "@/shared/ui/Icons";
import {
  DISPLAY_PALETTE_KEYS,
  type SavedTheme,
  type ThemeOption,
} from "../domain/types";
import { getThemeColorByPath } from "../domain/colorPaths";

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
  const { t } = useTranslation();
  const description =
    getThemeDescription(selectedThemeOption) || t("theme.summary.noDescription");

  return (
    <div className="theme-summary-view">
      <div className="theme-summary-head">
        <div className="theme-summary-copy">
          <p className="theme-summary-label">
            {t("theme.summary.themeLabel")} <span className="theme-summary-label-name">{selectedThemeOption.name}</span>
          </p>
          <p className="theme-card-description">{description}</p>
        </div>
        <button
          type="button"
          className="theme-customize-btn"
          onClick={onCustomize}
          aria-label={t("theme.summary.customizeAria", { name: selectedThemeOption.name })}
        >
          <span className="theme-customize-icon" aria-hidden="true">
            <EditIcon />
          </span>
        </button>
      </div>

      <section className="theme-section theme-section--saved">
        <h3 className="theme-section-heading">{t("theme.summary.savedThemes")}</h3>
        {savedThemes.length === 0 ? (
          <div className="saved-themes-empty" role="status">
            <p className="saved-themes-empty-text">
              {t("theme.summary.savedEmpty")}
            </p>
          </div>
        ) : (
          <div
            className="theme-card-list card-scroll-list saved-themes-list"
            role="list"
            aria-label={t("theme.summary.savedThemesAria")}
          >
            {savedThemes.map((saved) => (
              <ThemeCard
                key={saved.id}
                themeOption={savedThemeToOption(saved)}
                isSelected={saved.id === selectedThemeId}
                onClick={() => onApplySavedTheme(saved.id)}
                onDelete={() => onDeleteSavedTheme(saved.id)}
                deleteAriaLabel={t("theme.summary.deleteSavedAria", { name: saved.name })}
              />
            ))}
          </div>
        )}
      </section>

      <section className="theme-section theme-section--builtin">
        <h3 className="theme-section-heading">{t("theme.summary.builtInThemes")}</h3>
        <div
          className="theme-card-list card-scroll-list"
          role="list"
          aria-label={t("theme.summary.themeOptionsAria")}
          ref={listRef}
        >
          {themeOptions.map((themeOption) => (
            <ThemeCard
              key={themeOption.id}
              themeOption={themeOption}
              isSelected={themeOption.id === selectedThemeId}
              onClick={() => onThemeSelect(themeOption.id)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
