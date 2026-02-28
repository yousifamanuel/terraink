import type { Layout } from "../domain/types";
import { formatLayoutDimensions } from "../infrastructure/layoutRepository";

function getLayoutSymbolDataUri(layoutOption: Layout): string {
  const symbol = String(layoutOption?.symbol ?? "").trim();
  if (!symbol) return "";
  return `data:image/svg+xml;utf8,${encodeURIComponent(symbol)}`;
}

interface LayoutCardProps {
  layoutOption: Layout | null;
  onClick?: () => void;
  isSelected?: boolean;
}

export default function LayoutCard({
  layoutOption,
  onClick,
  isSelected = false,
}: LayoutCardProps) {
  if (!layoutOption) {
    return null;
  }

  const description =
    layoutOption.description?.trim() || "No description available.";
  const className = ["layout-card", isSelected ? "is-selected" : ""]
    .filter(Boolean)
    .join(" ");
  const symbolDataUri = getLayoutSymbolDataUri(layoutOption);
  const sizeText = formatLayoutDimensions(layoutOption);
  const infoText = `${layoutOption.categoryName} - ${sizeText}`;

  return (
    <button
      type="button"
      className={className}
      onClick={onClick}
      aria-pressed={isSelected}
    >
      <div className="layout-card-row">
        <div className="layout-card-copy">
          <p className="layout-card-name">{layoutOption.name}</p>
          <p className="layout-card-meta">{infoText}</p>
        </div>
        {symbolDataUri ? (
          <img
            className="layout-card-symbol"
            src={symbolDataUri}
            alt={`${layoutOption.name} ratio symbol`}
          />
        ) : null}
      </div>
      <p className="layout-card-description">{description}</p>
    </button>
  );
}
