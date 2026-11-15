import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { createCustomLayoutOption } from "@/features/layout/infrastructure/layoutRepository";
import {
  DISPLAY_PALETTE_KEYS,
  THEME_COLOR_GROUPS,
  DETAIL_COLOR_KEYS,
  type ThemeColorKey,
  type ThemeOption,
} from "@/features/theme/domain/types";
import { useColorEditorPrefs } from "@/features/theme/application/useColorEditorPrefs";
import type { ColorTargetGroup } from "@/features/theme/ui/ThemeColorEditor";
import { getThemeDescription } from "@/features/theme/application/themeDescription";
import { getPaletteColorLabel } from "@/features/theme/application/paletteColorLabel";
import {
  getColorChildren,
  getColorParent,
  getEditedThemeColor,
  getThemeColorByPath,
  hasOwnEditedColor,
  INHERIT_COLOR,
  THEME_COLOR_FALLBACKS,
} from "@/features/theme/domain/colorPaths";
import { normalizeHexColor } from "@/shared/utils/color";
import {
  buildDynamicColorChoices,
  createFallbackThemeOption,
} from "@/features/theme/domain/colorSuggestions";
import LayoutCard from "@/features/layout/ui/LayoutCard";
import MapDimensionFields from "./MapDimensionFields";
import ColorPicker from "@/features/theme/ui/ColorPicker";
import ThemeColorEditor from "@/features/theme/ui/ThemeColorEditor";
import ThemeSummarySection from "@/features/theme/ui/ThemeSummarySection";
import { useSaveThemeFlow } from "@/features/theme/ui/SaveThemeButton";
import { usePosterDispatch } from "@/features/poster/ui/PosterContext";
import { COLOR_ADJUST_DEFAULTS } from "@/features/poster/application/colorAdjustFields";
import ConfirmModal from "@/shared/ui/ConfirmModal";
import { CheckIcon, EditIcon } from "@/shared/ui/Icons";
import type { ResolvedTheme, SavedTheme } from "@/features/theme/domain/types";
import type { LayoutGroup } from "@/features/layout/domain/types";

const FALLBACK_COLOR = "#000000";

interface MapSettingsForm {
  theme: string;
  layout: string;
  width: string;
  height: string;
  distance: string;
  includeBuildings: boolean;
  includeWater: boolean;
  includeParks: boolean;
  includeAeroway: boolean;
  includeRail: boolean;
  includeRoads: boolean;
  includeRoadPath: boolean;
  includeRoadMinorLow: boolean;
  includeRoadOutline: boolean;
  includeBorders: boolean;
  includeLandcover?: boolean;
  showBorder?: boolean;
}

/** False when the map layer (or poster border) that uses the color is off. */
function isColorInUse(key: ThemeColorKey, form: MapSettingsForm): boolean {
  switch (key) {
    case "ui.border":
    case "ui.borderLine":
      return form.showBorder !== false;
    case "map.buildings":
      return form.includeBuildings;
    case "map.water":
    case "map.waterway":
      return form.includeWater;
    case "map.parks":
      return form.includeParks;
    case "map.landcover":
    case "map.forest":
    case "map.grass":
    case "map.farmland":
    case "map.wetland":
    case "map.sand":
    case "map.ice":
      return form.includeLandcover !== false;
    case "map.aeroway":
      return form.includeAeroway;
    case "map.rail":
      return form.includeRail;
    case "map.roads.path":
      return form.includeRoads && form.includeRoadPath;
    case "map.roads.minor_low":
      return form.includeRoads && form.includeRoadMinorLow;
    case "map.roads.outline":
      return form.includeRoads && form.includeRoadOutline;
    case "map.roads.major":
    case "map.roads.minor_high":
    case "map.roads.minor_mid":
      return form.includeRoads;
    case "map.borders":
      return form.includeBorders;
    default:
      return true;
  }
}

interface MapSettingsSectionProps {
  activeMobileTab?: string;
  form: MapSettingsForm;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onNumericFieldBlur: (event: React.FocusEvent<HTMLInputElement>) => void;
  onThemeChange: (themeId: string) => void;
  onLayoutChange: (layoutId: string) => void;
  selectedTheme: ResolvedTheme;
  themeOptions: ThemeOption[];
  layoutGroups: LayoutGroup[];
  minPosterCm: number;
  maxPosterCm: number;
  customColors: Record<string, string>;
  onColorChange: (key: string, value: string) => void;
  onResetColors: () => void;
  onColorEditorActiveChange?: (active: boolean) => void;
  effectiveTheme: ResolvedTheme;
  savedThemes: SavedTheme[];
  onAddSavedTheme: (theme: SavedTheme) => void;
  onUpdateSavedTheme: (themeId: string, changes: Partial<SavedTheme>) => void;
  onRemoveSavedTheme: (themeId: string) => void;
  onSetCustomColors: (colors: Record<string, string>) => void;
}

export default function MapSettingsSection({
  activeMobileTab,
  form,
  onChange,
  onNumericFieldBlur,
  onThemeChange,
  onLayoutChange,
  selectedTheme,
  themeOptions,
  layoutGroups,
  minPosterCm,
  maxPosterCm,
  customColors,
  onColorChange,
  onResetColors,
  onColorEditorActiveChange,
  effectiveTheme,
  savedThemes,
  onAddSavedTheme,
  onUpdateSavedTheme,
  onRemoveSavedTheme,
  onSetCustomColors,
}: MapSettingsSectionProps) {
  const { t } = useTranslation();
  const { dispatch } = usePosterDispatch();
  const [isThemeEditing, setIsThemeEditing] = useState(false);
  const [isLayoutEditing, setIsLayoutEditing] = useState(false);
  const [pendingDeleteThemeId, setPendingDeleteThemeId] = useState<
    string | null
  >(null);
  const defaultColorKey: ThemeColorKey = DISPLAY_PALETTE_KEYS[0] ?? "ui.bg";
  const [activeColorKey, setActiveColorKey] = useState<ThemeColorKey | null>(
    null,
  );
  const [activeColorSession, setActiveColorSession] = useState<{
    key: ThemeColorKey;
    seedColor: string;
    seedPalette: string[];
  } | null>(null);
  const themeListRef = useRef<HTMLDivElement | null>(null);
  const layoutGroupsRef = useRef<HTMLDivElement | null>(null);

  const selectedThemeOption = useMemo(() => {
    const matchingOption = themeOptions.find((t) => t.id === form.theme);
    if (matchingOption) return matchingOption;
    const matchingSaved = savedThemes.find((t) => t.id === form.theme);
    if (matchingSaved) {
      const palette = DISPLAY_PALETTE_KEYS.map(
        (key) => getThemeColorByPath(matchingSaved.colors, key) || "",
      );
      return {
        id: matchingSaved.id,
        name: matchingSaved.name,
        description: matchingSaved.description,
        palette,
      };
    }
    return createFallbackThemeOption(form.theme, selectedTheme);
  }, [form.theme, savedThemes, selectedTheme, themeOptions]);

  const currentThemePalette = useMemo(
    () =>
      DISPLAY_PALETTE_KEYS.map(
        (key) =>
          getEditedThemeColor(selectedTheme, customColors, key) ||
          FALLBACK_COLOR,
      ),
    [customColors, selectedTheme],
  );

  const summaryThemeOption = useMemo(
    () => ({ ...selectedThemeOption, palette: currentThemePalette }),
    [currentThemePalette, selectedThemeOption],
  );

  const activeColorChoices = useMemo(() => {
    if (!activeColorKey) return { suggestedColors: [], moreColors: [] };

    const sessionColor =
      activeColorSession?.key === activeColorKey
        ? activeColorSession.seedColor
        : "";
    const sessionPalette =
      activeColorSession?.key === activeColorKey
        ? activeColorSession.seedPalette
        : currentThemePalette;

    return buildDynamicColorChoices(
      sessionColor ||
        customColors[activeColorKey] ||
        getThemeColorByPath(selectedTheme, activeColorKey) ||
        currentThemePalette[0] ||
        "",
      sessionPalette,
    );
  }, [
    activeColorKey,
    activeColorSession,
    customColors,
    currentThemePalette,
    selectedTheme,
  ]);

  const { prefs: colorEditorPrefs, setPref: setColorEditorPref } =
    useColorEditorPrefs();

  const colorGroups = useMemo<ColorTargetGroup[]>(() => {
    const toTarget = (key: ThemeColorKey) => ({
      key,
      label: getPaletteColorLabel(key),
      color:
        getEditedThemeColor(selectedTheme, customColors, key) || FALLBACK_COLOR,
      isActive: activeColorKey === key,
      isOff: !isColorInUse(key, form),
    });
    const groups = THEME_COLOR_GROUPS.map((group) => ({
      id: group.id,
      label: t(`theme.groups.${group.id}`),
      // Each detail sits right after the main color it copies.
      targets: (colorEditorPrefs.showDetails
        ? [
            ...group.keys.flatMap((key) => [
              key,
              ...group.detailKeys.filter((detail) => getColorParent(detail) === key),
            ]),
            ...group.detailKeys.filter(
              (detail) => !group.keys.includes(getColorParent(detail) as ThemeColorKey),
            ),
          ]
        : group.keys
      ).map(toTarget),
    }));
    if (colorEditorPrefs.groupColors) return groups;
    return [
      { id: "all", label: "", targets: groups.flatMap((group) => group.targets) },
    ];
  }, [activeColorKey, colorEditorPrefs, customColors, form, selectedTheme, t]);

  const layoutOptions = useMemo(
    () => layoutGroups.flatMap((g) => g.options),
    [layoutGroups],
  );

  const selectedLayoutOption = useMemo(() => {
    const match = layoutOptions.find((lo) => lo.id === form.layout);
    if (match) return match;
    return createCustomLayoutOption(Number(form.width), Number(form.height));
  }, [form.height, form.layout, form.width, layoutOptions]);
  const selectedLayoutDescription =
    selectedLayoutOption.id === "custom"
      ? t("map.settings.customLayoutDescription")
      : t(`layout.descriptions.${selectedLayoutOption.id}`, {
          defaultValue:
            selectedLayoutOption.description?.trim() ||
            t("map.settings.noDescription"),
        });

  function clearColorPickerState() {
    setActiveColorKey(null);
    setActiveColorSession(null);
  }

  function handleThemeSelect(themeId: string) {
    onThemeChange(themeId);
    clearColorPickerState();
  }

  function handleLayoutSelectInline(layoutId: string) {
    onLayoutChange(layoutId);
    setIsLayoutEditing(false);
  }

  function handleSwatchClick(key: ThemeColorKey) {
    const seedColor =
      getEditedThemeColor(selectedTheme, customColors, key) ||
      currentThemePalette[0] ||
      "";
    setActiveColorKey(key);
    setActiveColorSession({
      key,
      seedColor,
      seedPalette: [...currentThemePalette],
    });
  }

  function handleOpenThemeEditor() {
    setIsThemeEditing(true);
    clearColorPickerState();
  }

  function handleDoneThemeEditor() {
    setIsThemeEditing(false);
    clearColorPickerState();
  }

  function handleOpenLayoutEditor() {
    setIsLayoutEditing(true);
    onLayoutChange("custom");
  }

  function handleDoneLayoutEditor() {
    setIsLayoutEditing(false);
  }

  function handleResetThemeColors() {
    onResetColors();
    if (!isThemeEditing) {
      clearColorPickerState();
      return;
    }
    const activeKey = activeColorKey || defaultColorKey;
    const seedPalette = DISPLAY_PALETTE_KEYS.map(
      (key) =>
        normalizeHexColor(getThemeColorByPath(selectedTheme, key)) ||
        normalizeHexColor(currentThemePalette[0]) ||
        "",
    );
    setActiveColorSession({
      key: activeKey,
      seedColor:
        seedPalette[DISPLAY_PALETTE_KEYS.indexOf(activeKey)] ||
        seedPalette[0] ||
        "",
      seedPalette,
    });
  }

  function handleApplySavedTheme(themeId: string) {
    onThemeChange(themeId);
    clearColorPickerState();
  }

  function handleRequestDeleteSavedTheme(themeId: string) {
    setPendingDeleteThemeId(themeId);
  }

  function handleCancelDeleteSavedTheme() {
    setPendingDeleteThemeId(null);
  }

  function handleConfirmDeleteSavedTheme() {
    const themeId = pendingDeleteThemeId;
    if (!themeId) return;

    if (form.theme === themeId) {
      // Snapshot the deleted theme's colors as customColors and switch to
      // a built-in base, so the map keeps showing the same colors.
      const deleted = savedThemes.find((t) => t.id === themeId);
      const fallbackBaseThemeId =
        themeOptions.find((t) => t.id !== themeId)?.id ?? form.theme;
      onThemeChange(fallbackBaseThemeId);
      if (deleted) {
        const colorOverrides: Record<string, string> = {};
        for (const key of DISPLAY_PALETTE_KEYS) {
          const color = getThemeColorByPath(deleted.colors, key);
          if (color) colorOverrides[key] = color;
        }
        onSetCustomColors(colorOverrides);
      }
    }

    onRemoveSavedTheme(themeId);
    setPendingDeleteThemeId(null);
  }

  // Saving the edited colors: the same flow as the Color tab's Save button.
  const saveFlow = useSaveThemeFlow({
    themeName: selectedThemeOption.name || selectedTheme.name || "",
    themeDescription: getThemeDescription(selectedThemeOption),
    colors: effectiveTheme,
    currentThemeId: form.theme,
    savedThemes,
    onAddSavedTheme,
    onUpdateSavedTheme,
    onThemeChange,
    onSaved: () => {
      onResetColors();
      dispatch({ type: "SET_FORM_FIELDS", fields: COLOR_ADJUST_DEFAULTS });
    },
  });

  function handleResetSingleColor(key: ThemeColorKey) {
    // Border colors drop their edit, so they copy background / text again.
    if (THEME_COLOR_FALLBACKS[key]) {
      onColorChange(key, "");
      return;
    }
    const originalColor =
      normalizeHexColor(getThemeColorByPath(selectedTheme, key)) ||
      normalizeHexColor(currentThemePalette[0]) ||
      "";
    if (!originalColor) return;
    onColorChange(key, originalColor);
  }

  const hasCustomColors = useMemo(
    () =>
      [...DISPLAY_PALETTE_KEYS, ...DETAIL_COLOR_KEYS].some((key) => {
        // "Apply to details" only changes something if the theme set its own color.
        if (customColors[key] === INHERIT_COLOR) {
          return hasOwnEditedColor(selectedTheme, {}, key);
        }
        const override = normalizeHexColor(customColors[key]);
        if (!override) return false;
        const original = normalizeHexColor(getThemeColorByPath(selectedTheme, key));
        return override !== original;
      }),
    [customColors, selectedTheme],
  );
  const activeColorLabel = activeColorKey
    ? getPaletteColorLabel(activeColorKey)
    : t("map.settings.colorFallback");

  useEffect(() => {
    onColorEditorActiveChange?.(false);
    return () => {
      onColorEditorActiveChange?.(false);
    };
  }, [onColorEditorActiveChange]);

  useEffect(() => {
    if (activeMobileTab !== "theme") {
      return;
    }
    const frameId = window.requestAnimationFrame(() => {
      const selectedThemeCard = themeListRef.current?.querySelector<HTMLElement>(
        ".theme-card.is-selected",
      );
      selectedThemeCard?.scrollIntoView({
        behavior: "auto",
        block: "nearest",
        inline: "start",
      });
    });
    return () => window.cancelAnimationFrame(frameId);
  }, [activeMobileTab]);

  useEffect(() => {
    if (activeMobileTab !== "layout" || isLayoutEditing) {
      return;
    }
    const frameId = window.requestAnimationFrame(() => {
      const selectedLayoutCard =
        layoutGroupsRef.current?.querySelector<HTMLElement>(
          ".layout-card.is-selected",
        );
      selectedLayoutCard?.scrollIntoView({
        behavior: "auto",
        block: "nearest",
        inline: "start",
      });
    });
    return () => window.cancelAnimationFrame(frameId);
  }, [activeMobileTab, isLayoutEditing]);

  const editorKey = activeColorKey || defaultColorKey;
  const editorChoices = activeColorKey
    ? activeColorChoices
    : buildDynamicColorChoices(currentThemePalette[0] || "", currentThemePalette);
  const editorColor =
    getEditedThemeColor(selectedTheme, customColors, editorKey) ||
    currentThemePalette[0] ||
    "";
  const { [editorKey]: _editorEdit, ...editsWithoutEditorKey } = customColors;
  const originalEditorColor =
    normalizeHexColor(
      getEditedThemeColor(selectedTheme, editsWithoutEditorKey, editorKey),
    ) ||
    normalizeHexColor(currentThemePalette[0]) ||
    "";
  const normalizedEditorColor = normalizeHexColor(editorColor) || "";
  // Detail colors of this main color that no longer copy it.
  const detailsWithOwnColor = getColorChildren(editorKey).filter((child) =>
    hasOwnEditedColor(selectedTheme, customColors, child),
  );
  const handleApplyToDetails = () => {
    for (const child of detailsWithOwnColor) {
      onColorChange(child, INHERIT_COLOR);
    }
  };
  const canResetEditorColor = Boolean(
    originalEditorColor &&
      normalizedEditorColor &&
      originalEditorColor !== normalizedEditorColor,
  );

  return (
    <section className="panel-block">
      <div className="map-settings-theme-part">
        <h2>{t("map.settings.theme")}</h2>

        {isThemeEditing ? (
          activeColorKey ? (
            <section className="panel-block color-editor-screen">
              <h2>{t("map.settings.colorEditor")}</h2>
              <div className="color-editor-header">
                <p className="theme-active-label">{t("map.settings.editing", { label: activeColorLabel })}</p>
                <div className="theme-edit-actions">
                  {detailsWithOwnColor.length > 0 ? (
                    <button
                      type="button"
                      className="theme-save-btn"
                      onClick={handleApplyToDetails}
                    >
                      {t("theme.editor.applyToDetails")}
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="theme-edit-done-btn"
                    onClick={clearColorPickerState}
                  >
                    {t("map.settings.done")}
                  </button>
                </div>
              </div>

              <ColorPicker
                currentColor={editorColor}
                suggestedColors={editorChoices.suggestedColors}
                moreColors={editorChoices.moreColors}
                onChange={(color: string) => onColorChange(editorKey, color)}
                onResetColor={() => handleResetSingleColor(editorKey)}
                canResetColor={canResetEditorColor}
              />

            </section>
          ) : (
            <ThemeColorEditor
              activeColorLabel={activeColorLabel}
              hasCustomColors={hasCustomColors}
              onResetAllColors={handleResetThemeColors}
              onSave={saveFlow.open}
              onDone={handleDoneThemeEditor}
              colorGroups={colorGroups}
              groupColors={colorEditorPrefs.groupColors}
              showDetails={colorEditorPrefs.showDetails}
              onGroupColorsChange={(value) =>
                setColorEditorPref("groupColors", value)
              }
              onShowDetailsChange={(value) =>
                setColorEditorPref("showDetails", value)
              }
              onTargetSelect={handleSwatchClick}
            />
          )
        ) : (
          <ThemeSummarySection
            listRef={themeListRef}
            themeOptions={themeOptions}
            selectedThemeId={form.theme}
            selectedThemeOption={summaryThemeOption}
            onThemeSelect={handleThemeSelect}
            onCustomize={handleOpenThemeEditor}
            savedThemes={savedThemes}
            onApplySavedTheme={handleApplySavedTheme}
            onDeleteSavedTheme={handleRequestDeleteSavedTheme}
          />
        )}
      </div>

      {saveFlow.modals}

      {pendingDeleteThemeId ? (
        <ConfirmModal
          title={t("map.settings.deleteThemeTitle")}
          message={t("map.settings.deleteThemeMessage", {
            name:
              savedThemes.find((th) => th.id === pendingDeleteThemeId)?.name ??
              t("map.settings.thisTheme"),
          })}
          confirmLabel={t("map.settings.delete")}
          cancelLabel={t("map.settings.cancel")}
          destructive
          onConfirm={handleConfirmDeleteSavedTheme}
          onCancel={handleCancelDeleteSavedTheme}
        />
      ) : null}

      <div className="map-settings-layout-part">
        <h2>{t("map.settings.layout")}</h2>
        <div className="layout-summary-head">
          <div className="layout-summary-copy">
            <p className="layout-summary-label">
              {t("map.settings.layoutLabel")}{" "}
              <span className="layout-summary-label-name">
                {selectedLayoutOption.name}
              </span>
            </p>
            <p className="layout-summary-description">
              {selectedLayoutDescription}
            </p>
          </div>
          {isLayoutEditing ? (
            <button
              type="button"
              className="theme-customize-btn"
              onClick={handleDoneLayoutEditor}
              aria-label={t("map.settings.doneEditingLayout")}
            >
              <span className="theme-customize-icon" aria-hidden="true">
                <CheckIcon />
              </span>
            </button>
          ) : (
            <button
              type="button"
              className="theme-customize-btn"
              onClick={handleOpenLayoutEditor}
              aria-label={t("map.settings.customizeLayoutSize")}
            >
              <span className="theme-customize-icon" aria-hidden="true">
                <EditIcon />
              </span>
            </button>
          )}
        </div>

        {isLayoutEditing ? (
          <div className="layout-custom-editor">
            <MapDimensionFields
              form={form}
              minPosterCm={minPosterCm}
              maxPosterCm={maxPosterCm}
              onChange={onChange}
              onNumericFieldBlur={onNumericFieldBlur}
              showDistanceField={false}
            />
          </div>
        ) : (
          <div className="layout-inline-groups" ref={layoutGroupsRef}>
            {layoutGroups.map((group) => (
              <section key={group.id} className="layout-inline-group">
                <h3>{t(`layout.groups.${group.id}`, { defaultValue: group.name })}</h3>
                <div className="layout-inline-list card-scroll-list">
                  {group.options.map((layoutOption) => (
                    <LayoutCard
                      key={layoutOption.id}
                      layoutOption={layoutOption}
                      isSelected={layoutOption.id === form.layout}
                      onClick={() => handleLayoutSelectInline(layoutOption.id)}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
