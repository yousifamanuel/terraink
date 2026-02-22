export default function MapSettingsSection({
  form,
  onChange,
  selectedTheme,
  themeOptions,
  minPosterCm,
  maxPosterCm,
}) {
  return (
    <section className="panel-block">
      <h2>Map Settings</h2>
      <label>
        Theme
        <select name="theme" value={form.theme} onChange={onChange}>
          {themeOptions.map((themeOption) => (
            <option key={themeOption.id} value={themeOption.id}>
              {themeOption.name}
            </option>
          ))}
        </select>
      </label>
      <p className="theme-note">{selectedTheme.description}</p>
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
    </section>
  );
}
