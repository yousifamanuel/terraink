import { useTranslation } from "react-i18next";
import { usePosterContext } from "./PosterContext";
import {
  COORDINATE_SEPARATORS,
  MAX_COORDINATE_SEPARATOR_LENGTH,
} from "@/shared/geo/posterBounds";

interface CoordinateSeparatorPickerProps {
  value: string;
}

/** Buttons for common separators, plus a small field for the user's own. */
export default function CoordinateSeparatorPicker({ value }: CoordinateSeparatorPickerProps) {
  const { t } = useTranslation();
  const { dispatch } = usePosterContext();
  const setSeparator = (next: string) =>
    dispatch({ type: "SET_FIELD", name: "coordinateSeparator", value: next });
  const isCustom = !COORDINATE_SEPARATORS.includes(value);

  return (
    <div className="separator-picker" role="group" aria-label={t("poster.typography.separator")}>
      <span className="separator-picker-label">{t("poster.typography.separator")}</span>
      <div className="separator-picker-grid">
        {COORDINATE_SEPARATORS.map((separator) => (
          <button
            key={separator || "none"}
            type="button"
            className={`separator-picker-btn${!isCustom && value === separator ? " is-active" : ""}`}
            aria-pressed={!isCustom && value === separator}
            aria-label={separator ? undefined : t("poster.typography.separatorNone")}
            title={separator ? undefined : t("poster.typography.separatorNone")}
            onClick={() => setSeparator(separator)}
          >
            {separator || "∅"}
          </button>
        ))}
        <input
          className={`separator-picker-custom${isCustom ? " is-active" : ""}`}
          type="text"
          maxLength={MAX_COORDINATE_SEPARATOR_LENGTH}
          value={isCustom ? value : ""}
          placeholder="…"
          aria-label={t("poster.typography.separatorCustom")}
          title={t("poster.typography.separatorCustom")}
          onChange={(event) => setSeparator(event.target.value)}
        />
      </div>
    </div>
  );
}
