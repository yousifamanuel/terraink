import { MAX_DISTANCE_METERS, MIN_DISTANCE_METERS } from "../../constants/appConfig";

export default function MapDimensionFields({
  form,
  minPosterCm,
  maxPosterCm,
  onChange,
  onNumericFieldBlur,
}) {
  return (
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
  );
}
