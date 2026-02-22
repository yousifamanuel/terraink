import { useMemo, useState } from "react";
import ThemeCard from "./ThemeCard";
import ThemeModal from "./ThemeModal";

function createFallbackThemeOption(themeId, selectedTheme) {
  return {
    id: themeId,
    name: String(selectedTheme?.name ?? themeId ?? "Theme"),
    description: String(selectedTheme?.description ?? ""),
    palette: [
      selectedTheme?.bg,
      selectedTheme?.water,
      selectedTheme?.parks,
      selectedTheme?.road_primary,
      selectedTheme?.road_secondary,
      selectedTheme?.road_residential,
      selectedTheme?.text,
    ].filter((value) => typeof value === "string" && value.trim().length > 0),
  };
}

export default function MapSettingsSection({
  form,
  onChange,
  onThemeChange,
  selectedTheme,
  themeOptions,
  minPosterCm,
  maxPosterCm,
}) {
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  const selectedThemeOption = useMemo(() => {
    const matchingOption = themeOptions.find((themeOption) => themeOption.id === form.theme);
    if (matchingOption) {
      return matchingOption;
    }
    return createFallbackThemeOption(form.theme, selectedTheme);
  }, [form.theme, selectedTheme, themeOptions]);

  function openThemeModal() {
    setIsThemeModalOpen(true);
  }

  function closeThemeModal() {
    setIsThemeModalOpen(false);
  }

  function handleThemeSelect(themeId) {
    onThemeChange(themeId);
    setIsThemeModalOpen(false);
  }

  return (
    <section className="panel-block">
      <h2>Map Settings</h2>
      <p className="theme-active-label">Theme: {selectedThemeOption.name}</p>
      <ThemeCard
        themeOption={selectedThemeOption}
        showName={false}
        onClick={openThemeModal}
      />

      <div className="field-grid triple">
        <label>
          Distance (m)
          <input
            name="distance"
            type="number"
            min="1000"
            max="50000"
            value={form.distance}
            onChange={onChange}
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
          />
        </label>
      </div>

      <ThemeModal
        open={isThemeModalOpen}
        themeOptions={themeOptions}
        selectedThemeId={form.theme}
        onSelectTheme={handleThemeSelect}
        onClose={closeThemeModal}
      />
    </section>
  );
}
