import { useEffect, useMemo, useRef, useState } from "react";
import { clamp } from "../../utils/number";
import {
  hexToRgb,
  hslToHexColor,
  normalizeHexColor,
  rgbToHexColor,
  rgbToHsl,
  toUniqueHexColors,
} from "../../utils/color";

const HUE_TRACK_GRADIENT =
  "linear-gradient(90deg, #ff0033 0%, #ff8c00 16%, #ffd500 32%, #4ac600 48%, #00b9ff 64%, #3a52ff 80%, #b600ff 90%, #ff0033 100%)";
const SLIDER_COMMIT_DELAY_MS = 180;

export default function ColorPicker({
  currentColor,
  suggestedColors = [],
  moreColors = [],
  onChange,
  onResetColor,
}) {
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
  const [customHsl, setCustomHsl] = useState(() =>
    rgbToHsl(hexToRgb(normalizedCurrentColor)),
  );
  const [rgbInput, setRgbInput] = useState(() =>
    hexToRgb(normalizedCurrentColor),
  );
  const [showMoreColors, setShowMoreColors] = useState(false);
  const [showCustomInputs, setShowCustomInputs] = useState(false);
  const pendingSliderHexRef = useRef(normalizedCurrentColor);
  const latestCommittedHexRef = useRef(normalizedCurrentColor);
  const sliderCommitTimerRef = useRef(null);
  const previewFieldRef = useRef(null);
  const isPreviewDraggingRef = useRef(false);

  const visiblePalette = showMoreColors
    ? [...suggestionList, ...additionalList]
    : suggestionList;

  const hueDegrees = Math.round(customHsl.h * 360);
  const shadePercent = Math.round((1 - customHsl.l) * 100);
  const saturationPercent = Math.round(customHsl.s * 100);

  const hueTrackStyle = { background: HUE_TRACK_GRADIENT };
  const shadeTrackStyle = {
    background: `linear-gradient(90deg, hsl(${hueDegrees}deg, ${Math.max(12, saturationPercent - 18)}%, 88%), hsl(${hueDegrees}deg, ${Math.max(20, saturationPercent)}%, 52%), hsl(${hueDegrees}deg, ${Math.min(100, saturationPercent + 8)}%, 12%))`,
  };
  const previewGradientStyle = {
    backgroundImage:
      "linear-gradient(to top, rgba(0, 0, 0, 1), rgba(0, 0, 0, 0)), linear-gradient(to right, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0))",
    backgroundColor: `hsl(${hueDegrees}deg, 100%, 50%)`,
  };
  const previewIndicatorStyle = {
    left: `${Math.round(customHsl.s * 100)}%`,
    top: `${Math.round((1 - customHsl.l) * 100)}%`,
    backgroundColor: hexInput,
  };

  function clearSliderCommitTimer() {
    if (!sliderCommitTimerRef.current) {
      return;
    }
    clearTimeout(sliderCommitTimerRef.current);
    sliderCommitTimerRef.current = null;
  }

  function scheduleSliderCommit(nextHex) {
    const normalized = normalizeHexColor(nextHex);
    if (!normalized) {
      return;
    }

    pendingSliderHexRef.current = normalized;
    clearSliderCommitTimer();
    sliderCommitTimerRef.current = setTimeout(() => {
      sliderCommitTimerRef.current = null;
      const candidateColor = normalizeHexColor(pendingSliderHexRef.current);
      if (!candidateColor || candidateColor === latestCommittedHexRef.current) {
        return;
      }
      onChange(candidateColor);
    }, SLIDER_COMMIT_DELAY_MS);
  }

  function commitColorImmediately(nextHex) {
    const normalized = normalizeHexColor(nextHex);
    if (!normalized || normalized === latestCommittedHexRef.current) {
      return;
    }
    clearSliderCommitTimer();
    onChange(normalized);
  }

  useEffect(() => {
    setHexInput(normalizedCurrentColor);
    setCustomHsl(rgbToHsl(hexToRgb(normalizedCurrentColor)));
    setRgbInput(hexToRgb(normalizedCurrentColor));
    pendingSliderHexRef.current = normalizedCurrentColor;
    latestCommittedHexRef.current = normalizedCurrentColor;
    clearSliderCommitTimer();
  }, [normalizedCurrentColor]);

  useEffect(() => {
    if (additionalList.length === 0) {
      setShowMoreColors(false);
    }
  }, [additionalList]);

  useEffect(
    () => () => {
      clearSliderCommitTimer();
    },
    [],
  );

  function handlePresetClick(color) {
    clearSliderCommitTimer();
    onChange(color);
  }

  function handleHexInput(event) {
    const nextValue = event.target.value;
    setHexInput(nextValue);
    const normalized = normalizeHexColor(
      nextValue.startsWith("#") ? nextValue : `#${nextValue}`,
    );
    if (!normalized) {
      return;
    }

    commitColorImmediately(normalized);
    setCustomHsl(rgbToHsl(hexToRgb(normalized)));
    setRgbInput(hexToRgb(normalized));
    pendingSliderHexRef.current = normalized;
  }

  function handleHexBlur() {
    setHexInput(normalizedCurrentColor);
  }

  function updateCustomHsl(nextHsl, commitMode = "none") {
    const nextHex = hslToHexColor(nextHsl);
    setCustomHsl(nextHsl);
    setHexInput(nextHex);
    setRgbInput(hexToRgb(nextHex));
    pendingSliderHexRef.current = nextHex;

    if (commitMode === "deferred") {
      scheduleSliderCommit(nextHex);
      return;
    }

    if (commitMode === "immediate") {
      commitColorImmediately(nextHex);
    }
  }

  function handleHueChange(event) {
    const hue = clamp(Number(event.target.value) / 360, 0, 1);
    const next = { ...customHsl, h: hue };
    updateCustomHsl(next, "deferred");
  }

  function handleShadeChange(event) {
    const lightness = clamp(1 - Number(event.target.value) / 100, 0, 1);
    const next = { ...customHsl, l: lightness };
    updateCustomHsl(next, "deferred");
  }

  function handleRgbInput(channel, rawValue) {
    const nextRgb = { ...rgbInput, [channel]: rawValue };
    setRgbInput(nextRgb);

    const values = [Number(nextRgb.r), Number(nextRgb.g), Number(nextRgb.b)];
    if (
      !values.every(
        (value) => Number.isFinite(value) && value >= 0 && value <= 255,
      )
    ) {
      return;
    }

    const nextHex = rgbToHexColor({ r: values[0], g: values[1], b: values[2] });
    setHexInput(nextHex);
    setCustomHsl(rgbToHsl(hexToRgb(nextHex)));
    pendingSliderHexRef.current = nextHex;
    commitColorImmediately(nextHex);
  }

  function handleResetColorClick() {
    clearSliderCommitTimer();
    onResetColor();
  }

  function updateFromPreviewPointer(clientX, clientY, commitMode = "deferred") {
    const previewArea = previewFieldRef.current;
    if (!previewArea) {
      return;
    }

    const bounds = previewArea.getBoundingClientRect();
    if (!bounds.width || !bounds.height) {
      return;
    }

    const saturation = clamp((clientX - bounds.left) / bounds.width, 0, 1);
    const lightness = clamp(1 - (clientY - bounds.top) / bounds.height, 0, 1);
    const next = { ...customHsl, s: saturation, l: lightness };
    updateCustomHsl(next, commitMode);
  }

  function handlePreviewPointerDown(event) {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    isPreviewDraggingRef.current = true;
    if (event.currentTarget.setPointerCapture) {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    updateFromPreviewPointer(event.clientX, event.clientY, "immediate");
  }

  function handlePreviewPointerMove(event) {
    if (!isPreviewDraggingRef.current) {
      return;
    }
    updateFromPreviewPointer(event.clientX, event.clientY, "deferred");
  }

  function handlePreviewPointerUp(event) {
    if (!isPreviewDraggingRef.current) {
      return;
    }

    isPreviewDraggingRef.current = false;
    if (event.currentTarget.releasePointerCapture) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    updateFromPreviewPointer(event.clientX, event.clientY, "deferred");
  }

  function handlePreviewPointerCancel() {
    isPreviewDraggingRef.current = false;
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
          {showMoreColors ? "Less" : "More"}
        </button>
        <button
          type="button"
          className={`color-grid-action${showCustomInputs ? " is-active" : ""}`}
          onClick={() => setShowCustomInputs((prev) => !prev)}
        >
          Custom
        </button>
        <button
          type="button"
          className="color-grid-action color-grid-reset"
          onClick={handleResetColorClick}
        >
          Reset Color
        </button>
      </div>

      {showCustomInputs ? (
        <div className="color-manual-panel color-custom-panel">
          <div
            ref={previewFieldRef}
            className="color-gradient-preview"
            style={previewGradientStyle}
            onPointerDown={handlePreviewPointerDown}
            onPointerMove={handlePreviewPointerMove}
            onPointerUp={handlePreviewPointerUp}
            onPointerCancel={handlePreviewPointerCancel}
            role="presentation"
          >
            <span
              className="color-gradient-preview-indicator"
              style={previewIndicatorStyle}
            />
          </div>

          <label className="color-slider-field">
            Color Hue
            <input
              type="range"
              min="0"
              max="360"
              step="1"
              value={hueDegrees}
              onChange={handleHueChange}
              className="color-slider color-hue-slider"
              style={hueTrackStyle}
            />
          </label>

          <label className="color-slider-field">
            Light / Dark
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={shadePercent}
              onChange={handleShadeChange}
              className="color-slider color-shade-slider"
              style={shadeTrackStyle}
            />
          </label>

          <label className="color-field-label color-hex-only-field">
            Hex
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

          <div className="color-rgb-grid">
            <label className="color-field-label">
              R
              <input
                type="number"
                className="color-rgb-input"
                min="0"
                max="255"
                value={rgbInput.r}
                onChange={(event) => handleRgbInput("r", event.target.value)}
              />
            </label>
            <label className="color-field-label">
              G
              <input
                type="number"
                className="color-rgb-input"
                min="0"
                max="255"
                value={rgbInput.g}
                onChange={(event) => handleRgbInput("g", event.target.value)}
              />
            </label>
            <label className="color-field-label">
              B
              <input
                type="number"
                className="color-rgb-input"
                min="0"
                max="255"
                value={rgbInput.b}
                onChange={(event) => handleRgbInput("b", event.target.value)}
              />
            </label>
          </div>
        </div>
      ) : null}
    </div>
  );
}
