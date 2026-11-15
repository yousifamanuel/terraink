import { useEffect, useRef, useState } from "react";
import { parseDecimalInput } from "@/shared/utils/number";

interface CoordinateFieldProps {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}

const format = (value: number) => Number(value).toFixed(6);

/**
 * Text field for a latitude/longitude. Keeps what the user types while
 * editing ("-", "52,"), applies the value once it is a valid number, and
 * shows the tidy 6-decimal form again when the field loses focus.
 */
export default function CoordinateField({ value, min, max, onChange }: CoordinateFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState(format(value));

  // Follow outside changes (dragging the marker), but never while typing.
  useEffect(() => {
    if (document.activeElement !== inputRef.current) setText(format(value));
  }, [value]);

  const parsed = parseDecimalInput(text);
  const isValid = parsed !== null && parsed >= min && parsed <= max;

  return (
    <input
      ref={inputRef}
      className={`form-control-tall${isValid ? "" : " is-invalid"}`}
      type="text"
      inputMode="decimal"
      autoComplete="off"
      value={text}
      aria-invalid={!isValid}
      onChange={(event) => {
        const next = event.target.value;
        setText(next);
        const nextValue = parseDecimalInput(next);
        if (nextValue !== null && nextValue >= min && nextValue <= max) onChange(nextValue);
      }}
      onBlur={() => setText(format(value))}
    />
  );
}
