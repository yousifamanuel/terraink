import {
  DISPLAY_PALETTE_KEYS,
  type ThemeOption,
  type ThemeColorKey,
} from "../domain/types";
import { TrashIcon } from "@/shared/ui/Icons";

interface ThemeCardProps {
  themeOption: ThemeOption | null;
  onClick?: () => void;
  isSelected?: boolean;
  showFullPalette?: boolean;
  onDelete?: () => void;
  deleteAriaLabel?: string;
}

export default function ThemeCard({
  themeOption,
  onClick,
  isSelected = false,
  showFullPalette = false,
  onDelete,
  deleteAriaLabel,
}: ThemeCardProps) {
  if (!themeOption) {
    return null;
  }

  const majorPaletteKeys: ThemeColorKey[] = showFullPalette
    ? DISPLAY_PALETTE_KEYS
    : [
        "ui.text",
        "map.land",
        "map.roads.major",
        "map.roads.minor_high",
        "map.roads.minor_mid",
      ];
  const majorPaletteIndices = majorPaletteKeys
    .map((key) => DISPLAY_PALETTE_KEYS.indexOf(key))
    .filter((index) => index >= 0);
  const palette = (() => {
    if (!Array.isArray(themeOption.palette)) return [];
    const seen = new Set<string>();
    const result: string[] = [];
    for (const index of majorPaletteIndices) {
      const color = themeOption.palette[index];
      if (color && !seen.has(color)) {
        seen.add(color);
        result.push(color);
      }
    }
    return result;
  })();
  const className = [
    "theme-card",
    isSelected ? "is-selected" : "",
    onDelete ? "theme-card--deletable" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const cardButton = (
    <button
      type="button"
      className={className}
      onClick={onClick}
      aria-pressed={isSelected}
      aria-label={themeOption.name}
    >
      <div
        className={[
          "theme-card-palette",
          showFullPalette ? "theme-card-palette--full" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        aria-hidden="true"
      >
        {palette.map((color, index) => (
          <span
            key={`${themeOption.id}-${color}-${index}`}
            className="theme-card-swatch"
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>
      <span className="theme-card-name-shadow" aria-hidden="true" />
      <p className="theme-card-name">{themeOption.name}</p>
    </button>
  );

  if (!onDelete) return cardButton;

  return (
    <div className="theme-card-wrap">
      {cardButton}
      <button
        type="button"
        className="theme-card-delete"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        aria-label={deleteAriaLabel ?? `Delete ${themeOption.name}`}
      >
        <TrashIcon />
      </button>
    </div>
  );
}
