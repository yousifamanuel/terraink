import { useEffect, useMemo, useState } from "react";
import { createCustomLayoutOption } from "@/features/layout/infrastructure/layoutRepository";
import {
  DISPLAY_PALETTE_KEYS,
  PALETTE_COLOR_LABELS,
  type ThemeOption,
} from "@/features/theme/domain/types";
import { normalizeHexColor } from "@/shared/utils/color";
import {
  buildDynamicColorChoices,
  createFallbackThemeOption,
} from "@/features/theme/domain/colorSuggestions";
import LayoutCard from "@/features/layout/ui/LayoutCard";
import MapDimensionFields from "./MapDimensionFields";
import MapSettingsPickers from "./MapSettingsPickers";
import ThemeColorEditor from "@/features/theme/ui/ThemeColorEditor";
import ThemeSummarySection from "@/features/theme/ui/ThemeSummarySection";
import type { PosterForm } from "@/features/poster/application/posterReducer";
import type { ResolvedTheme } from "@/features/theme/domain/types";
import type { LayoutGroup, Layout } from "@/features/layout/domain/types";

const FALLBACK_COLOR = "#000000";

interface MapSettingsSectionProps {
  form: PosterForm;
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
}

export default function MapSettingsSection({
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
}: MapSettingsSectionProps) {
  const [activePicker, setActivePicker] = useState("");
  const [isThemeEditing, setIsThemeEditing] = useState(false);
  const [isDetailLayersOpen, setIsDetailLayersOpen] = useState(false);
  const [activeColorKey, setActiveColorKey] = useState<string | null>(null);
  const [activeColorSession, setActiveColorSession] = useState<{
    key: string;
    seedColor: string;
    seedPalette: string[];
  } | null>(null);

  const selectedThemeOption = useMemo(() => {
    const matchingOption = themeOptions.find((t) => t.id === form.theme);
    if (matchingOption) return matchingOption;
    return createFallbackThemeOption(form.theme, selectedTheme);
  }, [form.theme, selectedTheme, themeOptions]);

  const currentThemePalette = useMemo(
    () =>
      DISPLAY_PALETTE_KEYS.map((key) => {
        const themeColor = (selectedTheme as any)?.[key] ?? FALLBACK_COLOR;
        return customColors[key] ?? themeColor;
      }),
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
        (selectedTheme as any)?.[activeColorKey] ||
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

  const colorTargets = useMemo(
    () =>
      DISPLAY_PALETTE_KEYS.map((key) => {
        const baseColor = (selectedTheme as any)?.[key] ?? FALLBACK_COLOR;
        const currentColor = customColors[key] ?? baseColor;
        return {
          key,
          label: PALETTE_COLOR_LABELS[key] ?? key,
          color: currentColor,
          isActive: activeColorKey === key,
        };
      }),
    [activeColorKey, customColors, selectedTheme],
  );

  const layoutOptions = useMemo(
    () => layoutGroups.flatMap((g) => g.options),
    [layoutGroups],
  );

  const selectedLayoutOption = useMemo(() => {
    const match = layoutOptions.find((lo) => lo.id === form.layout);
    if (match) return match;
    return createCustomLayoutOption(Number(form.width), Number(form.height));
  }, [form.height, form.layout, form.width, layoutOptions]);

  function openThemePicker() {
    setActivePicker("theme");
  }
  function openLayoutPicker() {
    setActivePicker("layout");
  }
  function closePicker() {
    setActivePicker("");
  }

  function toggleDetailLayers() {
    setIsDetailLayersOpen((prev) => !prev);
  }

  function clearColorPickerState() {
    setActiveColorKey(null);
    setActiveColorSession(null);
  }

  function handleThemeSelect(themeId: string) {
    onThemeChange(themeId);
    closePicker();
    clearColorPickerState();
  }

  function handleLayoutSelect(layoutId: string) {
    onLayoutChange(layoutId);
    closePicker();
  }

  function handleSwatchClick(key: string) {
    const seedColor =
      customColors[key] ??
      (selectedTheme as any)?.[key] ??
      currentThemePalette[0] ??
      "";
    setActiveColorKey(key);
    setActiveColorSession({
      key,
      seedColor,
      seedPalette: [...currentThemePalette],
    });
  }

  function handleOpenThemeEditor() {
    const defaultKey = DISPLAY_PALETTE_KEYS[0];
    handleSwatchClick(defaultKey);
    setIsThemeEditing(true);
  }

  function handleDoneThemeEditor() {
    setIsThemeEditing(false);
    clearColorPickerState();
  }

  function handleResetThemeColors() {
    onResetColors();
    if (!isThemeEditing) {
      clearColorPickerState();
      return;
    }
    const activeKey = activeColorKey || DISPLAY_PALETTE_KEYS[0];
    const seedPalette = DISPLAY_PALETTE_KEYS.map(
      (key) =>
        normalizeHexColor((selectedTheme as any)?.[key]) ||
        normalizeHexColor(currentThemePalette[0]) ||
        "",
    );
    setActiveColorSession({
      key: activeKey,
      seedColor:
        seedPalette[DISPLAY_PALETTE_KEYS.indexOf(activeKey as any)] ||
        seedPalette[0] ||
        "",
      seedPalette,
    });
  }

  function handleResetSingleColor(key: string) {
    const originalColor =
      normalizeHexColor((selectedTheme as any)?.[key]) ||
      normalizeHexColor(currentThemePalette[0]) ||
      "";
    if (!originalColor) return;
    onColorChange(key, originalColor);
  }

  const hasCustomColors = Object.keys(customColors).length > 0;
  const activeColorLabel = activeColorKey
    ? (PALETTE_COLOR_LABELS[activeColorKey] ?? "Color")
    : "Color";

  useEffect(() => {
    onColorEditorActiveChange?.(isThemeEditing);
  }, [isThemeEditing, onColorEditorActiveChange]);

  useEffect(() => {
    return () => {
      onColorEditorActiveChange?.(false);
    };
  }, [onColorEditorActiveChange]);

  if (isThemeEditing) {
    const editorKey = activeColorKey || DISPLAY_PALETTE_KEYS[0];
    const editorChoices = activeColorKey
      ? activeColorChoices
      : buildDynamicColorChoices(
          currentThemePalette[0] || "",
          currentThemePalette,
        );
    const editorColor =
      customColors[editorKey] ??
      (selectedTheme as any)?.[editorKey] ??
      currentThemePalette[0] ??
      "";

    return (
      <ThemeColorEditor
        activeColorLabel={activeColorLabel}
        hasCustomColors={hasCustomColors}
        onResetAllColors={handleResetThemeColors}
        onDone={handleDoneThemeEditor}
        colorTargets={colorTargets}
        onTargetSelect={handleSwatchClick}
        editorColor={editorColor}
        suggestedColors={editorChoices.suggestedColors}
        moreColors={editorChoices.moreColors}
        onColorChange={(color: string) => onColorChange(editorKey, color)}
        onResetColor={() => handleResetSingleColor(editorKey)}
      />
    );
  }

  return (
    <section className="panel-block">
      <h2>Map Settings</h2>

      <ThemeSummarySection
        themeName={selectedThemeOption.name}
        themeOption={summaryThemeOption}
        onCustomize={handleOpenThemeEditor}
        onOpenThemePicker={openThemePicker}
      />

      <p className="layout-active-label">Layout: {selectedLayoutOption.name}</p>
      <LayoutCard
        layoutOption={selectedLayoutOption}
        onClick={openLayoutPicker}
      />

      <MapDimensionFields
        form={form}
        minPosterCm={minPosterCm}
        maxPosterCm={maxPosterCm}
        onChange={onChange}
        onNumericFieldBlur={onNumericFieldBlur}
        showDistanceField={false}
      />

      <div className="map-details-section">
        <h3 className="map-details-subtitle">Map Details</h3>
        <div className="map-details-card">
          <MapDimensionFields
            form={form}
            minPosterCm={minPosterCm}
            maxPosterCm={maxPosterCm}
            onChange={onChange}
            onNumericFieldBlur={onNumericFieldBlur}
            showSizeFields={false}
          />

          <button
            type="button"
            className={`map-details-collapsible${isDetailLayersOpen ? " is-open" : ""}`}
            onClick={toggleDetailLayers}
            aria-expanded={isDetailLayersOpen}
            aria-controls="layer-visibility-options"
          >
            <span>Layer Visibility</span>
            <span className="map-details-collapsible-arrow" aria-hidden="true" />
          </button>

          {isDetailLayersOpen ? (
            <div id="layer-visibility-options" className="map-details-collapsible-content">
              <label className="toggle-field">
                <span>Show buildings</span>
                <span className="theme-switch">
                  <input
                    type="checkbox"
                    name="includeBuildings"
                    checked={Boolean(form.includeBuildings)}
                    onChange={onChange}
                  />
                  <span className="theme-switch-track" aria-hidden="true" />
                </span>
              </label>
              <label className="toggle-field">
                <span>Show water</span>
                <span className="theme-switch">
                  <input
                    type="checkbox"
                    name="includeWater"
                    checked={Boolean(form.includeWater)}
                    onChange={onChange}
                  />
                  <span className="theme-switch-track" aria-hidden="true" />
                </span>
              </label>
              <label className="toggle-field">
                <span>Show parks</span>
                <span className="theme-switch">
                  <input
                    type="checkbox"
                    name="includeParks"
                    checked={Boolean(form.includeParks)}
                    onChange={onChange}
                  />
                  <span className="theme-switch-track" aria-hidden="true" />
                </span>
              </label>
            </div>
          ) : null}
        </div>
      </div>

      <MapSettingsPickers
        activePicker={activePicker}
        onClosePicker={closePicker}
        themeOptions={themeOptions}
        selectedThemeId={form.theme}
        onThemeSelect={handleThemeSelect}
        layoutGroups={layoutGroups}
        selectedLayoutId={form.layout}
        onLayoutSelect={handleLayoutSelect}
      />
    </section>
  );
}
