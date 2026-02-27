import type { PosterForm } from "@/features/poster/application/posterReducer";
import type { FontOption } from "@/core/config";

interface TypographySectionProps {
  form: PosterForm;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  fontOptions: FontOption[];
}

export default function TypographySection({
  form,
  onChange,
  fontOptions,
}: TypographySectionProps) {
  return (
    <section className="panel-block">
      <h2>Typography</h2>
      <label className="toggle-field">
        <span>Poster text</span>
        <span className="theme-switch">
          <input
            type="checkbox"
            name="showPosterText"
            checked={Boolean(form.showPosterText)}
            onChange={onChange}
          />
          <span className="theme-switch-track" aria-hidden="true" />
        </span>
      </label>

      <div className="field-grid keep-two-mobile">
        <label>
          Display city
          <input
            className="form-control-tall"
            name="displayCity"
            value={form.displayCity}
            onChange={onChange}
            placeholder="Tokyo"
          />
        </label>
        <label>
          Display country
          <input
            className="form-control-tall"
            name="displayCountry"
            value={form.displayCountry}
            onChange={onChange}
            placeholder="Japan"
          />
        </label>
      </div>
      <label>
        Font
        <select
          className="form-control-tall"
          name="fontFamily"
          value={form.fontFamily}
          onChange={onChange}
        >
          {fontOptions.map((fontOption) => (
            <option
              key={fontOption.value || "default"}
              value={fontOption.value}
            >
              {fontOption.label}
            </option>
          ))}
        </select>
      </label>
    </section>
  );
}
