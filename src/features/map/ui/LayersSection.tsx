import type { PosterForm } from "@/features/poster/application/posterReducer";
import MapDimensionFields from "./MapDimensionFields";
import { useLocale } from "@/core/i18n/LocaleContext";

interface LayersSectionProps {
  form: PosterForm;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  minPosterCm: number;
  maxPosterCm: number;
  onNumericFieldBlur: (event: React.FocusEvent<HTMLInputElement>) => void;
}

export default function LayersSection({
  form,
  onChange,
  minPosterCm,
  maxPosterCm,
  onNumericFieldBlur,
}: LayersSectionProps) {
  const { t } = useLocale();
  return (
    <section className="panel-block">
      <p className="section-summary-label">{t("settings.layers")}</p>
      <label className="toggle-field">
        <span>{t("layers.showBuildings")}</span>
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
        <span>{t("layers.showWater")}</span>
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
        <span>{t("layers.showParks")}</span>
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
      <label className="toggle-field">
        <span>{t("layers.showRoads")}</span>
        <span className="theme-switch">
          <input
            type="checkbox"
            name="includeRoads"
            checked={Boolean(form.includeRoads)}
            onChange={onChange}
          />
          <span className="theme-switch-track" aria-hidden="true" />
        </span>
      </label>
      <label className="toggle-field">
        <span>{t("layers.showRail")}</span>
        <span className="theme-switch">
          <input
            type="checkbox"
            name="includeRail"
            checked={Boolean(form.includeRail)}
            onChange={onChange}
          />
          <span className="theme-switch-track" aria-hidden="true" />
        </span>
      </label>
      <label className="toggle-field">
        <span>{t("layers.showAeroway")}</span>
        <span className="theme-switch">
          <input
            type="checkbox"
            name="includeAeroway"
            checked={Boolean(form.includeAeroway)}
            onChange={onChange}
          />
          <span className="theme-switch-track" aria-hidden="true" />
        </span>
      </label>

      <div className="map-details-section">
        <h3 className="map-details-subtitle">{t("layers.mapDetails")}</h3>
        <div className="map-details-card">
          <MapDimensionFields
            form={form}
            minPosterCm={minPosterCm}
            maxPosterCm={maxPosterCm}
            onChange={onChange}
            onNumericFieldBlur={onNumericFieldBlur}
            showSizeFields={false}
          />
        </div>
      </div>
    </section>
  );
}
