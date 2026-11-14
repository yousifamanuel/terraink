interface SliderFieldProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  /** Shown after the number, e.g. "%". */
  unit?: string;
  onChange: (value: number) => void;
}

/** A labelled range slider with its current value shown on the right. */
export default function SliderField({
  label,
  value,
  min,
  max,
  step = 1,
  unit = "",
  onChange,
}: SliderFieldProps) {
  const decimals = String(step).split(".")[1]?.length ?? 0;
  return (
    <label className="slider-field">
      <span className="slider-field-head">
        <span>{label}</span>
        <span className="slider-field-value">
          {value.toFixed(decimals)}
          {unit}
        </span>
      </span>
      <input
        className="slider-field-input"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}
