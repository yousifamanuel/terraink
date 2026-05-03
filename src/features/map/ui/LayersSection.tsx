import MapDimensionFields from "./MapDimensionFields";

interface LayerForm {
  width: string;
  height: string;
  distance: string;
  includeLandcover: boolean;
  includeBuildings: boolean;
  includeWater: boolean;
  includeParks: boolean;
  includeAeroway: boolean;
  includeRail: boolean;
  includeRoads: boolean;
  includeRoadPath: boolean;
  includeRoadMinorLow: boolean;
  includeRoadOutline: boolean;
  includeSkiResorts: boolean;
  includeCycleWays: boolean;
}

interface LayersSectionProps {
  form: LayerForm;
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
  return (
    <section className="panel-block">
      <p className="section-summary-label">LAYERS</p>
      <label className="toggle-field">
        <span>Show landcover</span>
        <span className="theme-switch">
          <input
            type="checkbox"
            name="includeLandcover"
            checked={Boolean(form.includeLandcover)}
            onChange={onChange}
          />
          <span className="theme-switch-track" aria-hidden="true" />
        </span>
      </label>
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
      <label className="toggle-field">
        <span>Show roads</span>
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
        <span>Show rail</span>
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
        <span>Show aeroway</span>
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
      <label className="toggle-field">
        <span>Show cycle ways</span>
        <span className="theme-switch">
          <input
            type="checkbox"
            name="includeCycleWays"
            checked={Boolean(form.includeCycleWays)}
            onChange={onChange}
          />
          <span className="theme-switch-track" aria-hidden="true" />
        </span>
      </label>
      <label className="toggle-field">
        <span>Show ski resorts</span>
        <span className="theme-switch">
          <input
            type="checkbox"
            name="includeSkiResorts"
            checked={Boolean(form.includeSkiResorts)}
            onChange={onChange}
          />
          <span className="theme-switch-track" aria-hidden="true" />
        </span>
      </label>

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
        </div>
      </div>
    </section>
  );
}
