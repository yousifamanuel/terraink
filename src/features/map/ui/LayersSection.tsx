import type { LocationBoundaryStatus } from "@/features/poster/application/posterReducer";
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
  includeCycleways: boolean;
  includeCountryBorders: boolean;
  clipToBoundary: boolean;
}

interface LayersSectionProps {
  form: LayerForm;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  minPosterCm: number;
  maxPosterCm: number;
  onNumericFieldBlur: (event: React.FocusEvent<HTMLInputElement>) => void;
  hasSelectedLocation: boolean;
  boundaryStatus: LocationBoundaryStatus;
}

function resolveBoundaryHint(
  hasSelectedLocation: boolean,
  status: LocationBoundaryStatus,
  isEnabled: boolean,
): string {
  if (!hasSelectedLocation) {
    return "Pick a place from the location search to use its boundary.";
  }
  if (!isEnabled) {
    return "";
  }
  if (status === "loading") {
    return "Loading boundary…";
  }
  if (status === "unavailable") {
    return "No boundary outline is available for this place.";
  }
  return "";
}

export default function LayersSection({
  form,
  onChange,
  minPosterCm,
  maxPosterCm,
  onNumericFieldBlur,
  hasSelectedLocation,
  boundaryStatus,
}: LayersSectionProps) {
  const boundaryHint = resolveBoundaryHint(
    hasSelectedLocation,
    boundaryStatus,
    Boolean(form.clipToBoundary),
  );

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
        <span>Show cycle ways</span>
        <span className="theme-switch">
          <input
            type="checkbox"
            name="includeCycleways"
            checked={Boolean(form.includeCycleways)}
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
        <span>Show country borders</span>
        <span className="theme-switch">
          <input
            type="checkbox"
            name="includeCountryBorders"
            checked={Boolean(form.includeCountryBorders)}
            onChange={onChange}
          />
          <span className="theme-switch-track" aria-hidden="true" />
        </span>
      </label>

      <label
        className={`toggle-field${hasSelectedLocation ? "" : " toggle-field--disabled"}`}
      >
        <span>Clip to location boundary</span>
        <span className="theme-switch">
          <input
            type="checkbox"
            name="clipToBoundary"
            checked={Boolean(form.clipToBoundary)}
            disabled={!hasSelectedLocation}
            onChange={onChange}
          />
          <span className="theme-switch-track" aria-hidden="true" />
        </span>
      </label>
      {boundaryHint ? (
        <p className="layers-section__hint">{boundaryHint}</p>
      ) : null}

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
