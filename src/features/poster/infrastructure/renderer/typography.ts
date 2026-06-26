import { formatCoordinates } from "@/shared/geo/posterBounds";
import type { Coordinate } from "@/shared/geo/types";
import { APP_CREDIT_URL } from "@/core/config";
import { withAlpha } from "@/shared/utils/color";
import type { ResolvedTheme } from "@/features/theme/domain/types";
import {
  TEXT_DIMENSION_REFERENCE_PX,
  CITY_FONT_BASE_PX,
  COUNTRY_FONT_BASE_PX,
  COORDS_FONT_BASE_PX,
  ATTRIBUTION_FONT_BASE_PX,
  formatCityLabel,
  computeCityFontScale,
  computeAttributionColor,
} from "@/features/poster/domain/textLayout";
import {
  DEFAULT_POSTER_STYLE_TEMPLATE_ID,
  getPosterStyleTemplate,
  type PosterStyleTemplateId,
} from "@/features/poster/domain/posterStyleTemplates";

export function drawPosterText(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  theme: ResolvedTheme,
  center: Coordinate,
  city: string,
  country: string,
  fontFamily: string | undefined,
  showPosterText: boolean,
  showOverlay: boolean,
  includeCredits: boolean = true,
  templateId: PosterStyleTemplateId = DEFAULT_POSTER_STYLE_TEMPLATE_ID,
): void {
  const template = getPosterStyleTemplate(templateId);
  const text = template.text;
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

  ctx.save();

  if (showPosterText) {
    const cityLabel = formatCityLabel(city, text.letterSpacedCity);
    const cityFontSize =
      CITY_FONT_BASE_PX *
      dimScale *
      computeCityFontScale(city) *
      text.cityScale;
    const countryFontSize = COUNTRY_FONT_BASE_PX * dimScale * text.countryScale;
    const coordinateFontSize = COORDS_FONT_BASE_PX * dimScale * text.coordsScale;
    const cityY = height * text.cityY;
    const lineY = height * (text.dividerY ?? text.countryY);
    const countryY = height * text.countryY;
    const coordinatesY = height * text.coordsY;
    const anchorX = width * text.x;
    const maxTextWidth = width * text.width;

    if (text.panel) {
      ctx.fillStyle = withAlpha(theme.ui.bg, text.panel.alpha);
      ctx.fillRect(
        width * text.panel.x,
        height * text.panel.y,
        width * text.panel.width,
        height * text.panel.height,
      );
      ctx.strokeStyle = withAlpha(textColor, 0.22);
      ctx.lineWidth = Math.max(1, dimScale * 1.5);
      ctx.strokeRect(
        width * text.panel.x,
        height * text.panel.y,
        width * text.panel.width,
        height * text.panel.height,
      );
    }

    ctx.fillStyle = textColor;
    ctx.textAlign = text.align;
    ctx.textBaseline = "middle";
    ctx.font = `700 ${cityFontSize}px ${titleFontFamily}`;
    ctx.fillText(cityLabel, anchorX, cityY, maxTextWidth);

    if (text.showDivider) {
      ctx.strokeStyle = textColor;
      ctx.lineWidth = 3 * dimScale;
      ctx.beginPath();
      ctx.moveTo(width * (text.dividerStart ?? 0.4), lineY);
      ctx.lineTo(width * (text.dividerEnd ?? 0.6), lineY);
      ctx.stroke();
    }

    ctx.font = `300 ${countryFontSize}px ${titleFontFamily}`;
    ctx.fillText(country.toUpperCase(), anchorX, countryY, maxTextWidth);

    ctx.globalAlpha = 0.75;
    ctx.font = `400 ${coordinateFontSize}px ${bodyFontFamily}`;
    ctx.fillText(
      formatCoordinates(center.lat, center.lon),
      anchorX,
      coordinatesY,
      maxTextWidth,
    );
    ctx.globalAlpha = 1;
  }

  const margin = template.attribution.margin;
  ctx.fillStyle = attributionColor;
  ctx.globalAlpha = attributionAlpha;
  ctx.textBaseline = "bottom";
  ctx.font = `300 ${attributionFontSize}px ${bodyFontFamily}`;

  if (template.attribution.side === "stacked-left") {
    ctx.textAlign = "left";
    ctx.fillText(
      "\u00a9 OpenStreetMap contributors",
      width * margin,
      height * (1 - margin),
    );
    if (includeCredits) {
      ctx.fillText(
        `\u00a9 ${APP_CREDIT_URL}`,
        width * margin,
        height * (1 - margin) - attributionFontSize * 1.25,
      );
    }
    ctx.restore();
    return;
  }

  ctx.textAlign = "right";
  ctx.fillText(
    "\u00a9 OpenStreetMap contributors",
    width * (1 - margin),
    height * (1 - margin),
  );

  if (includeCredits) {
    const isRightStack = template.attribution.side === "right";
    ctx.textAlign = isRightStack ? "right" : "left";
    ctx.fillText(
      `\u00a9 ${APP_CREDIT_URL}`,
      isRightStack ? width * (1 - margin) : width * margin,
      isRightStack
        ? height * (1 - margin) - attributionFontSize * 1.25
        : height * (1 - margin),
    );
  }

  ctx.restore();
}
