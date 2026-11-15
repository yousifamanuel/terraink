import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ensureFont } from "@/core/services";
import type { FontOption } from "@/core/config";
import { ChevronDownIcon } from "@/shared/ui/Icons";

interface FontPickerProps {
  value: string;
  options: FontOption[];
  onSelect: (family: string) => void;
  /** Theme colors, so the list previews the poster look. */
  backgroundColor: string;
  textColor: string;
}

const DEFAULT_FAMILY = "Space Grotesk";

const fontStack = (family: string) =>
  `"${family || DEFAULT_FAMILY}", "${DEFAULT_FAMILY}", sans-serif`;

/**
 * Font dropdown: closed until clicked, then every font is listed at once,
 * each name written in its own font on the theme's colors. The fonts are
 * loaded only when the list is first opened.
 */
export default function FontPicker({
  value,
  options,
  onSelect,
  backgroundColor,
  textColor,
}: FontPickerProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const fontsRequested = useRef(false);

  const labelFor = (family: string) =>
    family
      ? (options.find((option) => option.value === family)?.label ?? family)
      : t("poster.typography.defaultFont");

  // Load every family the first time the list opens (not on page load).
  useEffect(() => {
    if (!isOpen || fontsRequested.current) return;
    fontsRequested.current = true;
    const families = options
      .map((option) => String(option.value || "").trim())
      .filter(Boolean);
    void Promise.allSettled(families.map((family) => ensureFont(family)));
  }, [isOpen, options]);

  // Close on a click outside or on Escape.
  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  const current = value.trim();

  return (
    <div ref={rootRef} className="font-picker">
      <button
        type="button"
        className="font-picker-trigger"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`${t("poster.typography.font")}: ${labelFor(current)}`}
        style={{ backgroundColor, color: textColor, fontFamily: fontStack(current) }}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span>{labelFor(current)}</span>
        <ChevronDownIcon
          className={`font-picker-chevron${isOpen ? " is-open" : ""}`}
          aria-hidden="true"
        />
      </button>
      {isOpen ? (
        <div
          className="font-picker-list"
          role="listbox"
          aria-label={t("poster.typography.font")}
          style={{ backgroundColor, color: textColor }}
        >
          {options.map((option) => {
            const family = String(option.value || "").trim();
            const isSelected = family === current;
            return (
              <button
                key={family || "default"}
                type="button"
                role="option"
                aria-selected={isSelected}
                className={`font-picker-option${isSelected ? " is-selected" : ""}`}
                style={{ fontFamily: fontStack(family) }}
                onClick={() => {
                  onSelect(family);
                  setIsOpen(false);
                }}
              >
                {labelFor(family)}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
