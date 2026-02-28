import type { ThemeOption } from "../domain/types";

interface ThemeCardProps {
  themeOption: ThemeOption | null;
  onClick?: () => void;
  isSelected?: boolean;
  showName?: boolean;
}

export default function ThemeCard({
  themeOption,
  onClick,
  isSelected = false,
  showName = true,
}: ThemeCardProps) {
  if (!themeOption) {
    return null;
  }

  const palette = Array.isArray(themeOption.palette) ? themeOption.palette : [];
  const description =
    themeOption.description?.trim() || "No description available.";
  const className = ["theme-card", isSelected ? "is-selected" : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={className}
      onClick={onClick}
      aria-pressed={isSelected}
    >
      {showName ? <p className="theme-card-name">{themeOption.name}</p> : null}
      <div className="theme-card-palette" aria-hidden="true">
        {palette.map((color, index) => (
          <span
            key={`${themeOption.id}-${color}-${index}`}
            className="theme-card-swatch"
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>
      <p className="theme-card-description">{description}</p>
    </button>
  );
}
