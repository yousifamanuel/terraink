import { useTranslation } from "react-i18next";
import type { Layout } from "../domain/types";
import { formatLayoutDimensions } from "../infrastructure/layoutRepository";
import { useAppTheme } from "@/features/appTheme/application/useAppTheme";

// The symbols' own colors (outline, shape), replaced by an app theme's.
const SYMBOL_OUTLINE = "#9CC3DA";
const SYMBOL_SHAPE = "#4B91B7";

function getLayoutSymbolDataUri(
  layoutOption: Layout,
  colors: { outline?: string; shape?: string },
): string {
  let symbol = String(layoutOption?.symbol ?? "").trim();
  if (!symbol) return "";
  if (colors.outline) symbol = symbol.split(SYMBOL_OUTLINE).join(colors.outline);
  if (colors.shape) symbol = symbol.split(SYMBOL_SHAPE).join(colors.shape);
  const normalizedSymbol = symbol.replace(
    /stroke-width=(['"])([\d.]+)\1/g,
    (_match, quote: string, value: string) => {
      const parsed = Number(value);
      if (!Number.isFinite(parsed)) {
        return `stroke-width=${quote}${value}${quote}`;
      }
      const thinner = Math.max(0.8, parsed * 0.5);
      return `stroke-width=${quote}${thinner}${quote}`;
    },
  );
  return `data:image/svg+xml;utf8,${encodeURIComponent(normalizedSymbol)}`;
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
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  if (!layoutOption) {
    return null;
  }
  const className = ["layout-card", isSelected ? "is-selected" : ""]
    .filter(Boolean)
    .join(" ");
  // An app theme draws the symbols in its text and accent colors.
  const symbolDataUri = getLayoutSymbolDataUri(layoutOption, {
    outline: colors?.text,
    shape: colors?.accent,
  });
  const sizeText = formatLayoutDimensions(layoutOption);

  return (
    <button
      type="button"
      className={className}
      onClick={onClick}
      aria-pressed={isSelected}
    >
      <div className="layout-card-copy">
        <p className="layout-card-name">{layoutOption.name}</p>
        <p className="layout-card-meta">{sizeText}</p>
      </div>
      {symbolDataUri ? (
        <img
          className="layout-card-symbol"
          src={symbolDataUri}
          alt={t("layout.card.ratioSymbolAlt", { name: layoutOption.name })}
        />
      ) : null}
    </button>
  );
}
