import { useEffect, useMemo, useState } from "react";
import { createCustomLayoutOption } from "../../lib/layouts";
import { displayPaletteKeys, paletteColorLabels } from "../../lib/themes";
import { normalizeHexColor } from "../../utils/color";
import {
  buildDynamicColorChoices,
  createFallbackThemeOption,
} from "../../utils/themeColor";
import LayoutCard from "./LayoutCard";
import MapDimensionFields from "./MapDimensionFields";
import MapSettingsPickers from "./MapSettingsPickers";
import ThemeColorEditor from "./ThemeColorEditor";
import ThemeSummarySection from "./ThemeSummarySection";

const FALLBACK_COLOR = "#000000";

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
}) {
  const [activePicker, setActivePicker] = useState("");
  const [isThemeEditing, setIsThemeEditing] = useState(false);
  const [activeColorKey, setActiveColorKey] = useState(null);
  const [activeColorSession, setActiveColorSession] = useState(null);

  const selectedThemeOption = useMemo(() => {
    const matchingOption = themeOptions.find((themeOption) => themeOption.id === form.theme);
    if (matchingOption) {
      return matchingOption;
    }
    return createFallbackThemeOption(form.theme, selectedTheme);
  }, [form.theme, selectedTheme, themeOptions]);

  const currentThemePalette = useMemo(
    () =>
      displayPaletteKeys.map((key) => {
        const themeColor = selectedTheme?.[key] ?? FALLBACK_COLOR;
        return customColors[key] ?? themeColor;
      }),
    [customColors, selectedTheme],
  );

  const summaryThemeOption = useMemo(
    () => ({
      ...selectedThemeOption,
      palette: currentThemePalette,
    }),
    [currentThemePalette, selectedThemeOption],
  );

  const activeColorChoices = useMemo(() => {
    if (!activeColorKey) {
      return { suggestedColors: [], moreColors: [] };
    }

    const sessionColor =
      activeColorSession?.key === activeColorKey ? activeColorSession.seedColor : "";
    const sessionPalette =
      activeColorSession?.key === activeColorKey
        ? activeColorSession.seedPalette
        : currentThemePalette;

    return buildDynamicColorChoices(
      sessionColor ||
        customColors[activeColorKey] ||
        selectedTheme?.[activeColorKey] ||
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
      displayPaletteKeys.map((key) => {
        const baseColor = selectedTheme?.[key] ?? FALLBACK_COLOR;
        const currentColor = customColors[key] ?? baseColor;
        return {
          key,
          label: paletteColorLabels[key],
          color: currentColor,
          isActive: activeColorKey === key,
        };
      }),
    [activeColorKey, customColors, selectedTheme],
  );

  const layoutOptions = useMemo(
    () => layoutGroups.flatMap((group) => group.options),
    [layoutGroups],
  );

  const selectedLayoutOption = useMemo(() => {
    const matchingOption = layoutOptions.find((layoutOption) => layoutOption.id === form.layout);
    if (matchingOption) {
      return matchingOption;
    }

    return createCustomLayoutOption(form.width, form.height);
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

  function clearColorPickerState() {
    setActiveColorKey(null);
    setActiveColorSession(null);
  }

  function handleThemeSelect(themeId) {
    onThemeChange(themeId);
    closePicker();
    clearColorPickerState();
  }

  function handleLayoutSelect(layoutId) {
    onLayoutChange(layoutId);
    closePicker();
  }

  function handleSwatchClick(key) {
    const seedColor =
      customColors[key] ?? selectedTheme?.[key] ?? currentThemePalette[0] ?? "";
    const seedPalette = [...currentThemePalette];
    setActiveColorKey(key);
    setActiveColorSession({
      key,
      seedColor,
      seedPalette,
    });
  }

  function handleOpenThemeEditor() {
    const defaultKey = displayPaletteKeys[0];
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

    const activeKey = activeColorKey || displayPaletteKeys[0];
    const seedPalette = displayPaletteKeys.map(
      (key) =>
        normalizeHexColor(selectedTheme?.[key]) ||
        normalizeHexColor(currentThemePalette[0]) ||
        "",
    );
    setActiveColorSession({
      key: activeKey,
      seedColor: seedPalette[displayPaletteKeys.indexOf(activeKey)] || seedPalette[0] || "",
      seedPalette,
    });
  }

  function handleResetSingleColor(key) {
    const originalColor =
      normalizeHexColor(selectedTheme?.[key]) ||
      normalizeHexColor(currentThemePalette[0]) ||
      "";
    if (!originalColor) {
      return;
    }
    onColorChange(key, originalColor);
  }

  const hasCustomColors = Object.keys(customColors).length > 0;
  const activeColorLabel = activeColorKey ? paletteColorLabels[activeColorKey] : "Color";

  useEffect(() => {
    onColorEditorActiveChange?.(isThemeEditing);
  }, [isThemeEditing, onColorEditorActiveChange]);

  useEffect(() => {
    return () => {
      onColorEditorActiveChange?.(false);
    };
  }, [onColorEditorActiveChange]);

  if (isThemeEditing) {
    const editorKey = activeColorKey || displayPaletteKeys[0];
    const editorChoices = activeColorKey
      ? activeColorChoices
      : buildDynamicColorChoices(
          currentThemePalette[0] || "",
          currentThemePalette,
        );
    const editorColor =
      customColors[editorKey] ??
      selectedTheme?.[editorKey] ??
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
        onColorChange={(color) => onColorChange(editorKey, color)}
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
      />

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
