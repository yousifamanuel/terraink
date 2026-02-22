export default function TypographySection({ form, onChange, fontOptions }) {
  return (
    <section className="panel-block">
      <h2>Typography</h2>
      <div className="field-grid">
        <label>
          Display city
          <input
            name="displayCity"
            value={form.displayCity}
            onChange={onChange}
            placeholder="Tokyo"
          />
        </label>
        <label>
          Display country
          <input
            name="displayCountry"
            value={form.displayCountry}
            onChange={onChange}
            placeholder="Japan"
          />
        </label>
      </div>
      <label>
        Font
        <select name="fontFamily" value={form.fontFamily} onChange={onChange}>
          {fontOptions.map((fontOption) => (
            <option key={fontOption.value || "default"} value={fontOption.value}>
              {fontOption.label}
            </option>
          ))}
        </select>
      </label>
    </section>
  );
}
