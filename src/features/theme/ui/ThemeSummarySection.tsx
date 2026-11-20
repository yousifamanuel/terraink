import { useState, type RefObject } from "react";
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
import {
  THEME_CATEGORIES,
  themesInCategory,
  type ThemeCategoryId,
} from "../domain/themeCategories";
import { useFavoriteThemes } from "../application/useFavoriteThemes";
import AppThemeFollowSwitch from "@/features/appTheme/ui/AppThemeFollowSwitch";

/** An extra filter group (e.g. a campaign's themes), selected first. */
export interface ThemeFilterGroup {
  id: string;
  /** Shown as is; not translated. */
  label: string;
  color: string;
  themeIds: string[];
}

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
  extraGroup?: ThemeFilterGroup | null;
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
  extraGroup = null,
}: ThemeSummarySectionProps) {
  const { t } = useTranslation();
  const { favoriteIds, toggleFavorite } = useFavoriteThemes();
  // The extra group, when given, is selected first; else "All".
  const [category, setCategory] = useState<string>(extraGroup?.id ?? "all");

  const savedOptions = savedThemes.map(savedThemeToOption);
  const savedIds = new Set(savedThemes.map((saved) => saved.id));
  // Favorites in the order they were marked (newest first); missing ones skipped.
  const favoriteOptions = favoriteIds
    .map(
      (id) =>
        themeOptions.find((option) => option.id === id) ??
        savedOptions.find((option) => option.id === id),
    )
    .filter((option): option is ThemeOption => Boolean(option));

  const selectTheme = (id: string) =>
    savedIds.has(id) ? onApplySavedTheme(id) : onThemeSelect(id);

  const renderCard = (option: ThemeOption, extra?: { onDelete?: () => void; deleteAriaLabel?: string }) => (
    <ThemeCard
      key={option.id}
      themeOption={option}
      isSelected={option.id === selectedThemeId}
      onClick={() => selectTheme(option.id)}
      isFavorite={favoriteIds.includes(option.id)}
      onToggleFavorite={() => toggleFavorite(option.id)}
      {...extra}
    />
  );

  // "All" lists every theme once; a category lists all its themes (a theme
  // can be in several).
  const visibleThemes =
    category === "all"
      ? themeOptions
      : category === extraGroup?.id
        ? extraGroup.themeIds
            .map((id) => themeOptions.find((option) => option.id === id))
            .filter((option): option is ThemeOption => Boolean(option))
        : themesInCategory(themeOptions, category as ThemeCategoryId);
  const description =
    getThemeDescription(selectedThemeOption) || t("theme.summary.noDescription");

  return (
    <div className="theme-summary-view">
      <AppThemeFollowSwitch />
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

      {favoriteOptions.length > 0 ? (
        <section className="theme-section theme-section--favorites">
          <h3 className="theme-section-heading">{t("theme.summary.favorites")}</h3>
          <div
            className="theme-card-list card-scroll-list"
            role="list"
            aria-label={t("theme.summary.favorites")}
          >
            {favoriteOptions.map((option) => renderCard(option))}
          </div>
        </section>
      ) : null}

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
            {savedThemes.map((saved) =>
              renderCard(savedThemeToOption(saved), {
                onDelete: () => onDeleteSavedTheme(saved.id),
                deleteAriaLabel: t("theme.summary.deleteSavedAria", { name: saved.name }),
              }),
            )}
          </div>
        )}
      </section>

      <section className="theme-section theme-section--builtin">
        <h3 className="theme-section-heading">{t("theme.summary.builtInThemes")}</h3>
        <div className="theme-category-tabs" role="tablist" aria-label={t("theme.categories.label")}>
          {[
            { id: "all", color: "", label: t("theme.categories.all") },
            ...(extraGroup ? [extraGroup] : []),
            ...THEME_CATEGORIES.map(({ id, color }) => ({
              id,
              color,
              label: t(`theme.categories.${id}`),
            })),
          ].map(({ id, color, label }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={category === id}
              className={`theme-category-tab${category === id ? " is-active" : ""}`}
              onClick={() => setCategory(id)}
            >
              {color ? (
                <span
                  className="theme-category-dot"
                  style={{ backgroundColor: color }}
                  aria-hidden="true"
                />
              ) : null}
              {label}
            </button>
          ))}
        </div>
        <div
          className="theme-card-list card-scroll-list"
          role="list"
          aria-label={t("theme.summary.themeOptionsAria")}
          ref={listRef}
        >
          {visibleThemes.map((option) => renderCard(option))}
        </div>
      </section>
    </div>
  );
}
