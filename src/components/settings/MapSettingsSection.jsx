import { useMemo, useState } from "react";
import { MAX_DISTANCE_METERS, MIN_DISTANCE_METERS } from "../../constants/appConfig";
import { createCustomLayoutOption } from "../../lib/layouts";
import { displayPaletteKeys, getThemePalette, paletteColorLabels } from "../../lib/themes";
import LayoutCard from "./LayoutCard";
import PickerModal from "./PickerModal";
import ThemeCard from "./ThemeCard";

const FALLBACK_COLOR = "#000000";

function createFallbackThemeOption(themeId, selectedTheme) {
  return {
    id: themeId,
    name: String(selectedTheme?.name ?? themeId ?? "Theme"),
    description: String(selectedTheme?.description ?? ""),
    palette: getThemePalette(selectedTheme),
  };
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
}) {
  const [activePicker, setActivePicker] = useState("");

  const selectedThemeOption = useMemo(() => {
    const matchingOption = themeOptions.find((themeOption) => themeOption.id === form.theme);
    if (matchingOption) {
      return matchingOption;
    }
    return createFallbackThemeOption(form.theme, selectedTheme);
  }, [form.theme, selectedTheme, themeOptions]);

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

  function handleThemeSelect(themeId) {
    onThemeChange(themeId);
    closePicker();
  }

  function handleLayoutSelect(layoutId) {
    onLayoutChange(layoutId);
    closePicker();
  }

  return (
    <section className="panel-block">
      <h2>Map Settings</h2>
      <p className="theme-active-label">Theme: {selectedThemeOption.name}</p>
      <ThemeCard
        themeOption={selectedThemeOption}
        showName={false}
        onClick={openThemePicker}
      />

      <div className="palette-editor">
        <div className="palette-editor-header">
          <p className="palette-editor-label">Customize Colors</p>
          {Object.keys(customColors).length > 0 && (
            <button
              type="button"
              className="palette-reset-btn"
              onClick={onResetColors}
            >
              Reset
            </button>
          )}
        </div>
        <div className="palette-editor-grid">
          {displayPaletteKeys.map((key) => {
            const baseColor = selectedTheme?.[key] ?? FALLBACK_COLOR;
            const currentColor = customColors[key] ?? baseColor;
            return (
              <label key={key} className="palette-color-item">
                <input
                  type="color"
                  value={currentColor}
                  onChange={(e) => onColorChange(key, e.target.value)}
                  title={paletteColorLabels[key]}
                />
                <span className="palette-color-name">{paletteColorLabels[key]}</span>
              </label>
            );
          })}
        </div>
      </div>

      <p className="layout-active-label">Layout: {selectedLayoutOption.name}</p>
      <LayoutCard
        layoutOption={selectedLayoutOption}
        onClick={openLayoutPicker}
      />

      <div className="field-grid triple">
        <label>
          Distance (m)
          <input
            name="distance"
            type="number"
            min={MIN_DISTANCE_METERS}
            max={MAX_DISTANCE_METERS}
            value={form.distance}
            onChange={onChange}
            onBlur={onNumericFieldBlur}
          />
        </label>
        <label>
          Width (cm)
          <input
            name="width"
            type="number"
            min={minPosterCm}
            max={maxPosterCm}
            step="0.1"
            value={form.width}
            onChange={onChange}
            onBlur={onNumericFieldBlur}
          />
        </label>
        <label>
          Height (cm)
          <input
            name="height"
            type="number"
            min={minPosterCm}
            max={maxPosterCm}
            step="0.1"
            value={form.height}
            onChange={onChange}
            onBlur={onNumericFieldBlur}
          />
        </label>
      </div>

      <PickerModal
        open={activePicker === "theme"}
        title="Choose Theme"
        titleId="theme-picker-title"
        onClose={closePicker}
      >
        <div className="picker-option-list">
          {themeOptions.map((themeOption) => (
            <ThemeCard
              key={themeOption.id}
              themeOption={themeOption}
              isSelected={themeOption.id === form.theme}
              onClick={() => handleThemeSelect(themeOption.id)}
            />
          ))}
        </div>
      </PickerModal>

      <PickerModal
        open={activePicker === "layout"}
        title="Choose Layout"
        titleId="layout-picker-title"
        onClose={closePicker}
      >
        <div className="layout-picker-groups">
          {layoutGroups.map((group) => (
            <section
              key={group.id}
              className="layout-picker-group"
              aria-label={group.name}
            >
              <h4>{group.name}</h4>
              <div className="picker-option-list">
                {group.options.map((layoutOption) => (
                  <LayoutCard
                    key={layoutOption.id}
                    layoutOption={layoutOption}
                    isSelected={layoutOption.id === form.layout}
                    onClick={() => handleLayoutSelect(layoutOption.id)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </PickerModal>
    </section>
  );
}
