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
  const SLIDER_MIN = 0;
  const SLIDER_MAX = 1000;

  const clampDistance = (value: number) =>
    Math.min(Math.max(value, MIN_DISTANCE_METERS), MAX_DISTANCE_METERS);

  const getDistanceStep = (distanceMeters: number) => {
    if (distanceMeters < 100_000) return 100;
    if (distanceMeters < 1_000_000) return 1_000;
    if (distanceMeters < 10_000_000) return 10_000;
    return 50_000;
  };

  const snapDistanceToAdaptiveStep = (distanceMeters: number) => {
    const bounded = clampDistance(distanceMeters);
    const step = getDistanceStep(bounded);
    return clampDistance(Math.round(bounded / step) * step);
  };

  const distanceToSliderValue = (distanceMeters: number) => {
    const minLog = Math.log(MIN_DISTANCE_METERS);
    const maxLog = Math.log(MAX_DISTANCE_METERS);
    const ratio =
      (Math.log(clampDistance(distanceMeters)) - minLog) / (maxLog - minLog);
    return Math.round(SLIDER_MIN + ratio * (SLIDER_MAX - SLIDER_MIN));
  };

  const sliderValueToDistance = (sliderValue: number) => {
    const minLog = Math.log(MIN_DISTANCE_METERS);
    const maxLog = Math.log(MAX_DISTANCE_METERS);
    const ratio = (sliderValue - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN);
    const distance = Math.exp(minLog + ratio * (maxLog - minLog));
    return snapDistanceToAdaptiveStep(distance);
  };

  const formatDistance = (distanceMeters: number) => {
    if (distanceMeters >= 1_000_000) {
      const millions = distanceMeters / 1_000_000;
      const text = Number.isInteger(millions)
        ? millions.toString()
        : millions.toFixed(1).replace(/\.0$/, "");
      return `${text}M m`;
    }

    if (distanceMeters >= 100_000) {
      const thousands = distanceMeters / 1_000;
      const text = Number.isInteger(thousands)
        ? thousands.toString()
        : thousands.toFixed(1).replace(/\.0$/, "");
      return `${text}K m`;
    }

    return `${Math.round(distanceMeters).toLocaleString()} m`;
  };

  const emitDistanceChange = (nextDistance: number) => {
    const syntheticEvent = {
      target: {
        name: "distance",
        value: String(snapDistanceToAdaptiveStep(nextDistance)),
        type: "range",
      },
    } as React.ChangeEvent<HTMLInputElement>;

    onChange(syntheticEvent);
  };

  const parsedDistance = Number(form.distance);
  const distanceValue = Number.isFinite(parsedDistance)
    ? clampDistance(parsedDistance)
    : MIN_DISTANCE_METERS;
  const sliderValue = distanceToSliderValue(distanceValue);

  const sliderMetaMarks = [
    MIN_DISTANCE_METERS,
    100_000,
    1_000_000,
    MAX_DISTANCE_METERS,
  ];

  const sliderPositionPercent = (distanceMeters: number) =>
    ((distanceToSliderValue(distanceMeters) - SLIDER_MIN) /
      (SLIDER_MAX - SLIDER_MIN)) *
    100;

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

      <label className="distance-slider-field">
        <span>
          <span>Distance (m)</span>
          <input
            className="distance-slider-input"
            name="distance"
            type="number"
            min={MIN_DISTANCE_METERS}
            max={MAX_DISTANCE_METERS}
            step="any"
            value={form.distance}
            onChange={onChange}
            onBlur={onNumericFieldBlur}
            aria-label="Distance in meters"
          />
        </span>
        <input
          className="distance-slider"
          name="distance-slider-log"
          type="range"
          min={SLIDER_MIN}
          max={SLIDER_MAX}
          step={1}
          value={sliderValue}
          onChange={(event) =>
            emitDistanceChange(
              sliderValueToDistance(Number(event.target.value)),
            )
          }
          aria-label="Distance in meters"
        />
        <span className="distance-slider-meta">
          {sliderMetaMarks.map((mark, index) => {
            const isFirst = index === 0;
            const isLast = index === sliderMetaMarks.length - 1;
            const left = sliderPositionPercent(mark);
            return (
              <span
                key={mark}
                className="distance-slider-meta-mark"
                style={{
                  left: `${left}%`,
                  transform: isFirst
                    ? "translateX(0)"
                    : isLast
                      ? "translateX(-100%)"
                      : "translateX(-50%)",
                }}
              >
                {formatDistance(mark)}
              </span>
            );
          })}
        </span>
      </label>
    </div>
  );
}
