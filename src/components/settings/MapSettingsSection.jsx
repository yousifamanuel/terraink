import { useMemo, useState } from "react";
import { MAX_DISTANCE_METERS, MIN_DISTANCE_METERS } from "../../constants/appConfig";
import { createCustomLayoutOption } from "../../lib/layouts";
import { displayPaletteKeys, getThemePalette, paletteColorLabels } from "../../lib/themes";
import ColorPicker from "./ColorPicker";
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
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [activeColorKey, setActiveColorKey] = useState(null);

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

  function handleSwatchClick(key) {
    setActiveColorKey((prev) => (prev === key ? null : key));
  }

  function handleTogglePalette() {
    setPaletteOpen((prev) => {
      if (prev) {
        setActiveColorKey(null);
      }
      return !prev;
    });
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
        <button
          type="button"
          className="palette-editor-toggle"
          onClick={handleTogglePalette}
          aria-expanded={paletteOpen}
        >
          <span>Customize Colors</span>
          <span className={`palette-toggle-arrow${paletteOpen ? " open" : ""}`}>▾</span>
        </button>

        {paletteOpen && (
          <div className="palette-editor-body">
            <div className="palette-editor-grid">
              {displayPaletteKeys.map((key) => {
                const baseColor = selectedTheme?.[key] ?? FALLBACK_COLOR;
                const currentColor = customColors[key] ?? baseColor;
                const isActive = activeColorKey === key;
                return (
                  <button
                    key={key}
                    type="button"
                    className={`palette-color-item${isActive ? " is-active" : ""}`}
                    onClick={() => handleSwatchClick(key)}
                    aria-pressed={isActive}
                    aria-label={`${paletteColorLabels[key]}: ${currentColor}`}
                  >
                    <span
                      className="palette-color-swatch"
                      style={{ backgroundColor: currentColor }}
                    />
                    <span className="palette-color-name">{paletteColorLabels[key]}</span>
                  </button>
                );
              })}
            </div>

            {activeColorKey && (
              <ColorPicker
                currentColor={
                  customColors[activeColorKey] ??
                  selectedTheme?.[activeColorKey] ??
                  FALLBACK_COLOR
                }
                onChange={(color) => onColorChange(activeColorKey, color)}
              />
            )}

            {Object.keys(customColors).length > 0 && (
              <button
                type="button"
                className="palette-reset-btn"
                onClick={() => {
                  onResetColors();
                  setActiveColorKey(null);
                }}
              >
                Reset Colors
              </button>
            )}
          </div>
        )}
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
