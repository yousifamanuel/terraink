import { formatCoordinates } from "@/shared/geo/posterBounds";
import type { Coordinate } from "@/shared/geo/types";
import { APP_CREDIT_URL } from "@/core/config";
import { buildFontStack, resolveFontSelection } from "@/core/fonts/catalog";
import {
  TEXT_DIMENSION_REFERENCE_PX,
  TEXT_CITY_Y_RATIO,
  TEXT_DIVIDER_Y_RATIO,
  TEXT_COUNTRY_Y_RATIO,
  TEXT_COORDS_Y_RATIO,
  TEXT_EDGE_MARGIN_RATIO,
  CITY_TEXT_SHRINK_THRESHOLD,
  CITY_FONT_BASE_PX,
  CITY_FONT_MIN_PX,
  COUNTRY_FONT_BASE_PX,
  COORDS_FONT_BASE_PX,
  ATTRIBUTION_FONT_BASE_PX,
  isLatinScript,
  formatCityLabel,
} from "@/features/poster/domain/textLayout";
import type { ThemeColors } from "@/features/theme/domain/types";
import { parseHex } from "@/shared/utils/color";

export function drawPosterText(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  theme: Partial<ThemeColors>,
  center: Coordinate,
  city: string,
  country: string,
  fontFamily: string | undefined,
  fontVariant: string | undefined,
  showPosterText: boolean,
  showOverlay: boolean,
  includeCredits: boolean = true,
): void {
  const textColor = theme.ui?.text || "#111111";
  const landColor = theme.map?.land || "#808080";
  const landRgb = parseHex(landColor);
  const landLuma = landRgb
    ? (0.2126 * landRgb.r + 0.7152 * landRgb.g + 0.0722 * landRgb.b) / 255
    : 0.5;
  const attributionColor = showOverlay
    ? textColor
    : landLuma < 0.52
      ? "#f5faff"
      : "#0e1822";
  const attributionAlpha = showOverlay ? 0.55 : 0.9;
  const resolvedFont = resolveFontSelection({ fontFamily, fontVariant });
  const titleFontFamily = buildFontStack(
    resolvedFont.family.titleFamily,
    resolvedFont.family.titleFallback,
  );
  const bodyFontFamily = buildFontStack(
    resolvedFont.family.bodyFamily,
    resolvedFont.family.bodyFallback,
  );

  const dimScale = Math.max(
    0.45,
    Math.min(width, height) / TEXT_DIMENSION_REFERENCE_PX,
  );
  const attributionFontSize = ATTRIBUTION_FONT_BASE_PX * dimScale;

  if (showPosterText) {
    const cityLabel = formatCityLabel(city);
    const cityLength = Math.max(city.length, 1);
    let cityFontSize = CITY_FONT_BASE_PX * dimScale;
    if (cityLength > CITY_TEXT_SHRINK_THRESHOLD) {
      cityFontSize = Math.max(
        CITY_FONT_MIN_PX * dimScale,
        cityFontSize * (CITY_TEXT_SHRINK_THRESHOLD / cityLength),
      );
    }

    const countryFontSize = COUNTRY_FONT_BASE_PX * dimScale;
    const coordinateFontSize = COORDS_FONT_BASE_PX * dimScale;
    const cityY = height * TEXT_CITY_Y_RATIO;
    const lineY = height * TEXT_DIVIDER_Y_RATIO;
    const countryY = height * TEXT_COUNTRY_Y_RATIO;
    const coordinatesY = height * TEXT_COORDS_Y_RATIO;

    ctx.fillStyle = textColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `${resolvedFont.variant.weight} ${cityFontSize}px ${titleFontFamily}`;
    ctx.fillText(cityLabel, width * 0.5, cityY);

    ctx.strokeStyle = textColor;
    ctx.lineWidth = 3 * dimScale;
    ctx.beginPath();
    ctx.moveTo(width * 0.4, lineY);
    ctx.lineTo(width * 0.6, lineY);
    ctx.stroke();

    ctx.font = `${resolvedFont.variant.weight} ${countryFontSize}px ${titleFontFamily}`;
    ctx.fillText(country.toUpperCase(), width * 0.5, countryY);

    ctx.globalAlpha = 0.75;
    ctx.font = `${resolvedFont.variant.weight} ${coordinateFontSize}px ${bodyFontFamily}`;
    ctx.fillText(
      formatCoordinates(center.lat, center.lon),
      width * 0.5,
      coordinatesY,
    );
    ctx.globalAlpha = 1;
  }

  ctx.fillStyle = attributionColor;
  ctx.globalAlpha = attributionAlpha;
  ctx.textAlign = "right";
  ctx.textBaseline = "bottom";
  ctx.font = `${resolvedFont.variant.weight} ${attributionFontSize}px ${bodyFontFamily}`;
  ctx.fillText(
    "\u00a9 OpenStreetMap contributors",
    width * (1 - TEXT_EDGE_MARGIN_RATIO),
    height * (1 - TEXT_EDGE_MARGIN_RATIO),
  );
  ctx.globalAlpha = 1;

  if (includeCredits) {
    ctx.fillStyle = attributionColor;
    ctx.globalAlpha = attributionAlpha;
    ctx.textAlign = "left";
    ctx.textBaseline = "bottom";
    ctx.font = `${resolvedFont.variant.weight} ${attributionFontSize}px ${bodyFontFamily}`;
    ctx.fillText(
      `created with ${APP_CREDIT_URL}`,
      width * TEXT_EDGE_MARGIN_RATIO,
      height * (1 - TEXT_EDGE_MARGIN_RATIO),
    );
    ctx.globalAlpha = 1;
  }
}
