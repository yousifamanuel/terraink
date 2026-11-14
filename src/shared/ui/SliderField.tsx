import type React from "react";
import { useTranslation } from "react-i18next";
import { ResetIcon } from "./Icons";

interface SliderFieldProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  /** Shown after the number, e.g. "%". */
  unit?: string;
  /** When set, a reset button sits to the right of the slider. */
  defaultValue?: number;
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
  defaultValue,
  onChange,
}: SliderFieldProps) {
  const { t } = useTranslation();
  const decimals = String(step).split(".")[1]?.length ?? 0;
  const fill = max > min ? ((value - min) / (max - min)) * 100 : 0;
  return (
    <label className="slider-field">
      <span className="slider-field-head">
        <span>{label}</span>
        <span className="slider-field-value">
          {value.toFixed(decimals)}
          {unit}
        </span>
      </span>
      <span className="slider-field-row">
        <input
          className="distance-slider slider-field-input"
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          style={{ "--slider-fill": `${fill}%` } as React.CSSProperties}
          onChange={(event) => onChange(Number(event.target.value))}
        />
        {defaultValue !== undefined ? (
          <button
            type="button"
            className="slider-field-reset"
            title={t("shell.common.resetDefault")}
            aria-label={`${label}: ${t("shell.common.resetDefault")}`}
            onClick={(event) => {
              event.preventDefault();
              onChange(defaultValue);
            }}
          >
            <ResetIcon aria-hidden="true" />
          </button>
        ) : null}
      </span>
    </label>
  );
}
