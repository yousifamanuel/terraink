interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  label: string;
  /** Shown after the label, e.g. a "New" tag. */
  labelExtra?: React.ReactNode;
  value: T;
  options: SegmentedOption<T>[];
  onChange: (value: T) => void;
}

/** A row of buttons where exactly one is selected (e.g. Top | Bottom). */
export default function SegmentedControl<T extends string>({
  label,
  labelExtra,
  value,
  options,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <div className="segmented-control" role="radiogroup" aria-label={label}>
      <span className="segmented-control-label">
        {label}
        {labelExtra}
      </span>
      <div
        className="segmented-control-buttons"
        style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
      >
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={value === option.value}
            className={`segmented-control-btn${value === option.value ? " is-active" : ""}`}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
