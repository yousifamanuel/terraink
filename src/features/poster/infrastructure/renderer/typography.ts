import { formatCoordinates } from "@/shared/geo/posterBounds";
import type { Coordinate } from "@/shared/geo/types";
import { APP_CREDIT_URL } from "@/core/config";
import {
  TEXT_DIMENSION_REFERENCE_PX,
  TEXT_CITY_Y_RATIO,
  TEXT_DIVIDER_Y_RATIO,
  TEXT_COUNTRY_Y_RATIO,
  TEXT_COORDS_Y_RATIO,
  TEXT_EDGE_MARGIN_RATIO,
  CITY_FONT_BASE_PX,
  COUNTRY_FONT_BASE_PX,
  COORDS_FONT_BASE_PX,
  ATTRIBUTION_FONT_BASE_PX,
  isLatinScript,
  formatCityLabel,
  computeAttributionColor,
} from "@/features/poster/domain/textLayout";

export function drawPosterText(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  theme: { ui?: { text?: string } },
  center: Coordinate,
  city: string,
  country: string,
  fontFamily: string | undefined,
  showPosterText: boolean,
  showOverlay: boolean,
  includeCredits: boolean = true,
  textAlign: 'left' | 'center' | 'right' = 'center',
  cityFontScale: number = 1,
  countryFontScale: number = 1,
  coordsFontScale: number = 1,
): void {
  const textColor = theme.ui?.text || "#111111";
  const landColor = theme.map?.land || "#808080";
  const attributionColor = computeAttributionColor(textColor, landColor, showOverlay);
  const attributionAlpha = showOverlay ? 0.55 : 0.9;
  const titleFontFamily = fontFamily
    ? `"${fontFamily}", "Space Grotesk", sans-serif`
    : '"Space Grotesk", sans-serif';
  const bodyFontFamily = fontFamily
    ? `"${fontFamily}", "IBM Plex Mono", monospace`
    : '"IBM Plex Mono", monospace';

  const dimScale = Math.max(
    0.45,
    Math.min(width, height) / TEXT_DIMENSION_REFERENCE_PX,
  );
  const attributionFontSize = ATTRIBUTION_FONT_BASE_PX * dimScale;

  if (showPosterText) {
    const cityLabel = formatCityLabel(city);
    const cityLength = Math.max(city.length, 1);
    let cityFontSize = CITY_FONT_BASE_PX * dimScale * cityFontScale;
    if (cityLength > CITY_TEXT_SHRINK_THRESHOLD) {
      cityFontSize = Math.max(
        CITY_FONT_MIN_PX * dimScale * cityFontScale,
        cityFontSize * (CITY_TEXT_SHRINK_THRESHOLD / cityLength),
      );
    }

    const countryFontSize = COUNTRY_FONT_BASE_PX * dimScale * countryFontScale;
    const coordinateFontSize = COORDS_FONT_BASE_PX * dimScale * coordsFontScale;
    const cityY = height * TEXT_CITY_Y_RATIO;
    const lineY = height * TEXT_DIVIDER_Y_RATIO;
    const countryY = height * TEXT_COUNTRY_Y_RATIO;
    const coordinatesY = height * TEXT_COORDS_Y_RATIO;

    const margin = width * TEXT_EDGE_MARGIN_RATIO * 2;
    const textX =
      textAlign === 'left' ? margin :
      textAlign === 'right' ? width - margin :
      width * 0.5;
    const dividerLen = width * 0.2;
    const dividerStartX =
      textAlign === 'left' ? margin :
      textAlign === 'right' ? width - margin - dividerLen :
      width * 0.4;

    ctx.fillStyle = textColor;
    ctx.textAlign = textAlign;
    ctx.textBaseline = "middle";
    ctx.font = `700 ${cityFontSize}px ${titleFontFamily}`;
    ctx.fillText(cityLabel, textX, cityY);

    ctx.strokeStyle = textColor;
    ctx.lineWidth = 3 * dimScale;
    ctx.beginPath();
    ctx.moveTo(dividerStartX, lineY);
    ctx.lineTo(dividerStartX + dividerLen, lineY);
    ctx.stroke();

    ctx.font = `300 ${countryFontSize}px ${titleFontFamily}`;
    ctx.fillText(country.toUpperCase(), textX, countryY);

    ctx.globalAlpha = 0.75;
    ctx.font = `400 ${coordinateFontSize}px ${bodyFontFamily}`;
    ctx.fillText(
      formatCoordinates(center.lat, center.lon),
      textX,
      coordinatesY,
    );
    ctx.globalAlpha = 1;
  }

  ctx.fillStyle = attributionColor;
  ctx.globalAlpha = attributionAlpha;
  ctx.textAlign = "right";
  ctx.textBaseline = "bottom";
  ctx.font = `300 ${attributionFontSize}px ${bodyFontFamily}`;
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
    ctx.font = `300 ${attributionFontSize}px ${bodyFontFamily}`;
    ctx.fillText(
      `© ${APP_CREDIT_URL}`,
      width * TEXT_EDGE_MARGIN_RATIO,
      height * (1 - TEXT_EDGE_MARGIN_RATIO),
    );
    ctx.globalAlpha = 1;
  }
}
