import {
  useEffect,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from "react";
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
  /** The chosen filter, kept by the parent (e.g. while the editor is open); null = default. */
  filter?: string | null;
  onFilterChange?: (filter: string | null) => void;
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
  filter,
  onFilterChange,
}: ThemeSummarySectionProps) {
  const { t } = useTranslation();
  const { favoriteIds, toggleFavorite } = useFavoriteThemes();
  // The extra group, when given, is selected first; else "All". The parent
  // can keep the choice, so it survives opening the editor.
  const startCategory = extraGroup?.id ?? "all";
  const [ownCategory, setOwnCategory] = useState<string | null>(null);
  const category = (onFilterChange ? filter : ownCategory) ?? startCategory;
  const setCategory = (next: string) =>
    (onFilterChange ?? setOwnCategory)(next === startCategory ? null : next);

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

  // Favorites and Saved are filters too; they can't be picked while empty,
  // and the list falls back once the last one is removed.
  const filterCounts: Record<string, number> = {
    favorites: favoriteOptions.length,
    saved: savedThemes.length,
  };
  const isEmptyFilter = (id: string) => id in filterCounts && filterCounts[id] === 0;
  useEffect(() => {
    if (isEmptyFilter(category)) setCategory(startCategory);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, favoriteOptions.length, savedThemes.length]);

  // A new filter shows its list from the start.
  useEffect(() => {
    const list = listRef?.current;
    if (list) list.scrollLeft = 0;
  }, [category, listRef]);

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

  const savedCards = () =>
    savedThemes.map((saved) =>
      renderCard(savedThemeToOption(saved), {
        onDelete: () => onDeleteSavedTheme(saved.id),
        deleteAriaLabel: t("theme.summary.deleteSavedAria", { name: saved.name }),
      }),
    );

  // On mobile, favorites and saved themes lead the one card row, each behind a
  // vertical label (desktop shows them in their own sections instead).
  const leadingGroup = (key: string, label: string, cards: ReactNode[]) =>
    cards.length > 0 ? (
      <div className="theme-list-group" key={key}>
        <span className="theme-list-group-label">{label}</span>
        {cards}
      </div>
    ) : null;

  // A row label on its own (mobile), e.g. before the built-in themes.
  const rowLabel = (key: string, label: string) => (
    <div className="theme-list-group" key={key}>
      <span className="theme-list-group-label">{label}</span>
    </div>
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

  // The filter decides what shows: Favorites or Saved only those, All
  // everything (favorites, saved, built-in), a category only its themes.
  const isAll = category === "all";
  const listTitle =
    category === "favorites"
      ? t("theme.summary.favorites")
      : category === "saved"
        ? t("theme.summary.savedThemes")
        : category === extraGroup?.id
          ? extraGroup.label
          : isAll
            ? t("theme.summary.builtInThemes")
            : t(`theme.categories.${category}`);
  const listCards: ReactNode[] =
    category === "favorites"
      ? favoriteOptions.map((option) => renderCard(option))
      : category === "saved"
        ? savedCards()
        : visibleThemes.map((option) => renderCard(option));

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

      <div className="theme-category-tabs" role="tablist" aria-label={t("theme.categories.label")}>
        {[
          { id: "favorites", color: "", label: t("theme.categories.favorites") },
          { id: "saved", color: "", label: t("theme.categories.saved") },
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
            className={`theme-category-tab${category === id ? " is-active" : ""}${color ? " has-color" : ""}`}
            style={color ? ({ "--category-color": color } as CSSProperties) : undefined}
            disabled={isEmptyFilter(id)}
            onClick={() => setCategory(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Desktop: with "All", favorites and saved themes get their own
          sections; on mobile they lead the card row below instead. */}
      {isAll && favoriteOptions.length > 0 ? (
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

      {isAll ? (
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
              {savedCards()}
            </div>
          )}
        </section>
      ) : null}

      <section className="theme-section theme-section--builtin">
        <h3 className="theme-section-heading">{listTitle}</h3>
        <div
          className="theme-card-list card-scroll-list"
          role="list"
          aria-label={t("theme.summary.themeOptionsAria")}
          ref={listRef}
        >
          {isAll
            ? [
                leadingGroup("favorites", t("theme.categories.favorites"), favoriteOptions.map((option) => renderCard(option))),
                leadingGroup("saved", t("theme.categories.saved"), savedCards()),
                rowLabel("list-title", listTitle),
                ...listCards,
              ]
            : [rowLabel("list-title", listTitle), ...listCards]}
        </div>
      </section>
    </div>
  );
}
