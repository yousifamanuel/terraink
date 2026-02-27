import { MIN_DISTANCE_METERS, MAX_DISTANCE_METERS } from "@/core/config";
import type { PosterForm } from "@/features/poster/application/posterReducer";

interface MapDimensionFieldsProps {
  form: PosterForm;
  minPosterCm: number;
  maxPosterCm: number;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onNumericFieldBlur: (event: React.FocusEvent<HTMLInputElement>) => void;
}

export default function MapDimensionFields({
  form,
  minPosterCm,
  maxPosterCm,
  onChange,
  onNumericFieldBlur,
}: MapDimensionFieldsProps) {
  return (
    <div className="map-dimension-fields">
      <div className="map-size-fields-row">
        <label>
          Width (cm)
          <input
            className="form-control-tall"
            name="width"
            type="number"
            min={minPosterCm}
            max={maxPosterCm}
            step="any"
            value={form.width}
            onChange={onChange}
            onBlur={onNumericFieldBlur}
          />
        </label>
        <label>
          Height (cm)
          <input
            className="form-control-tall"
            name="height"
            type="number"
            min={minPosterCm}
            max={maxPosterCm}
            step="any"
            value={form.height}
            onChange={onChange}
            onBlur={onNumericFieldBlur}
          />
        </label>
      </div>
      <label>
        Distance (m)
        <input
          className="form-control-tall"
          name="distance"
          type="number"
          min={MIN_DISTANCE_METERS}
          max={MAX_DISTANCE_METERS}
          value={form.distance}
          onChange={onChange}
          onBlur={onNumericFieldBlur}
        />
      </label>
    </div>
  );
}
