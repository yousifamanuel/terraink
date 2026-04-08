import { useState, useRef, useEffect } from "react";
import type { FontOption } from "@/core/config";

interface FontPickerProps {
  value: string;
  fontOptions: FontOption[];
  onChange: (value: string) => void;
}

export default function FontPicker({
  value,
  fontOptions,
  onChange,
}: FontPickerProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = fontOptions.find((o) => o.value === value) ?? fontOptions[0];

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  function fontStyle(family: string): React.CSSProperties {
    return {
      fontFamily: family
        ? `"${family}", "Space Grotesk", sans-serif`
        : '"Space Grotesk", sans-serif',
    };
  }

  return (
    <div className="font-picker" ref={containerRef}>
      <button
        type="button"
        className="font-picker-trigger form-control-tall"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span style={fontStyle(selected.value)}>{selected.label}</span>
        <span className="font-picker-arrow" aria-hidden="true">
          {open ? "\u25B4" : "\u25BE"}
        </span>
      </button>
      {open && (
        <ul
          className="font-picker-list"
          role="listbox"
          aria-label="Font options"
        >
          {fontOptions.map((option) => (
            <li
              key={option.value || "default"}
              role="option"
              aria-selected={option.value === value}
              className={`font-picker-option${option.value === value ? " is-selected" : ""}`}
              style={fontStyle(option.value)}
              onMouseDown={() => {
                onChange(option.value);
                setOpen(false);
              }}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
