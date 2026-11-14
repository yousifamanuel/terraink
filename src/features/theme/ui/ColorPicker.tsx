import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { HexColorPicker } from "react-colorful";
import { normalizeHexColor, toUniqueHexColors } from "@/shared/utils/color";

interface ColorPickerProps {
  currentColor: string;
  suggestedColors?: string[];
  moreColors?: string[];
  onChange: (color: string) => void;
  onResetColor: () => void;
  canResetColor?: boolean;
}

export default function ColorPicker({
  currentColor,
  suggestedColors = [],
  moreColors = [],
  onChange,
  onResetColor,
  canResetColor = true,
}: ColorPickerProps) {
  const { t } = useTranslation();
  const suggestionList = useMemo(
    () => toUniqueHexColors(suggestedColors).slice(0, 10),
    [suggestedColors],
  );

  const additionalList = useMemo(() => {
    const initialSet = new Set(suggestionList);
    return toUniqueHexColors(moreColors)
      .filter((color) => !initialSet.has(color))
      .slice(0, 15);
  }, [moreColors, suggestionList]);

  const normalizedCurrentColor =
    normalizeHexColor(currentColor) ||
    suggestionList[0] ||
    additionalList[0] ||
    "#000000";
  const [hexInput, setHexInput] = useState(normalizedCurrentColor);
  const [showMoreColors, setShowMoreColors] = useState(false);

  const visiblePalette = showMoreColors
    ? [...suggestionList, ...additionalList]
    : suggestionList;

  useEffect(() => {
    setHexInput(normalizedCurrentColor);
  }, [normalizedCurrentColor]);

  useEffect(() => {
    if (additionalList.length === 0) {
      setShowMoreColors(false);
    }
  }, [additionalList]);

  function handlePresetClick(color: string) {
    onChange(color);
  }

  function handlePickerChange(nextColor: string) {
    const normalized = normalizeHexColor(nextColor);
    if (!normalized) {
      return;
    }

    setHexInput(normalized);
    onChange(normalized);
  }

  function handleHexInput(event: React.ChangeEvent<HTMLInputElement>) {
    const nextValue = event.target.value;
    setHexInput(nextValue);

    const normalized = normalizeHexColor(
      nextValue.startsWith("#") ? nextValue : `#${nextValue}`,
    );
    if (!normalized) {
      return;
    }

    onChange(normalized);
  }

  function handleHexBlur() {
    setHexInput(normalizedCurrentColor);
  }

  return (
    <div className="color-picker-popup">
      <div className="color-preset-grid">
        {visiblePalette.map((color) => (
          <button
            key={color}
            type="button"
            className={`color-preset-cell${normalizedCurrentColor === color ? " is-active" : ""}`}
            style={{ backgroundColor: color }}
            onClick={() => handlePresetClick(color)}
            aria-label={color}
            title={color}
          />
        ))}
      </div>

      <div className="color-picker-actions">
        <button
          type="button"
          className={`color-grid-action${showMoreColors ? " is-active" : ""}`}
          onClick={() => setShowMoreColors((prev) => !prev)}
          disabled={additionalList.length === 0}
        >
          {showMoreColors ? t("theme.colorPicker.less") : t("theme.colorPicker.more")}
        </button>
        <button
          type="button"
          className="color-grid-action color-grid-reset"
          onClick={onResetColor}
          disabled={!canResetColor}
        >
          {t("theme.colorPicker.resetColor")}
        </button>
      </div>

      <div className="color-manual-panel color-custom-panel">
        <div className="color-picker-frame">
          <HexColorPicker color={normalizedCurrentColor} onChange={handlePickerChange} />
        </div>

        <label className="color-field-label color-hex-only-field">
          {t("theme.colorPicker.hex")}
          <input
            type="text"
            className="color-hex-input"
            value={hexInput}
            onChange={handleHexInput}
            onBlur={handleHexBlur}
            maxLength={7}
            spellCheck={false}
            autoComplete="off"
          />
        </label>
      </div>
    </div>
  );
}
