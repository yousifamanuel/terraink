import { formatCoordinates } from "@/shared/geo/posterBounds";
import { APP_CREDIT_URL } from "@/core/config";
import { withAlpha } from "@/shared/utils/color";
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
import type { PosterStyleTemplate } from "@/features/poster/domain/posterStyleTemplates";

interface PosterTextOverlayProps {
  city: string;
  country: string;
  lat: number;
  lon: number;
  fontFamily: string;
  textColor: string;
  landColor: string;
  showPosterText: boolean;
  includeCredits: boolean;
  showOverlay: boolean;
  template: PosterStyleTemplate;
}

export default function PosterTextOverlay({
  city,
  country,
  lat,
  lon,
  fontFamily,
  textColor,
  landColor,
  showPosterText,
  includeCredits,
  showOverlay,
  template,
}: PosterTextOverlayProps) {
  const toCqMin = (px: number) => (px / TEXT_DIMENSION_REFERENCE_PX) * 100;
  const text = template.text;

  const titleFont = fontFamily
    ? `"${fontFamily}", "Space Grotesk", sans-serif`
    : '"Space Grotesk", sans-serif';
  const bodyFont = fontFamily
    ? `"${fontFamily}", "IBM Plex Mono", monospace`
    : '"IBM Plex Mono", monospace';

  const cityLabel = formatCityLabel(city, text.letterSpacedCity);
  const cityFontSize = `${
    toCqMin(CITY_FONT_BASE_PX) *
    computeCityFontScale(city) *
    text.cityScale
  }cqmin`;
  const countryFontSize = `${
    toCqMin(COUNTRY_FONT_BASE_PX) * text.countryScale
  }cqmin`;
  const coordsFontSize = `${toCqMin(COORDS_FONT_BASE_PX) * text.coordsScale}cqmin`;
  const attributionFontSize = `${toCqMin(ATTRIBUTION_FONT_BASE_PX)}cqmin`;
  const attributionColor = computeAttributionColor(textColor, landColor, showOverlay);
  const attributionOpacity = showOverlay ? 0.55 : 0.9;
  const margin = template.attribution.margin * 100;
  const attributionBaseStyle = {
    fontFamily: bodyFont,
    color: attributionColor,
    opacity: attributionOpacity,
    fontSize: attributionFontSize,
  };
  const textBoxStyle = {
    left:
      text.align === "center"
        ? `${(text.x - text.width / 2) * 100}%`
        : text.align === "right"
          ? `${(text.x - text.width) * 100}%`
          : `${text.x * 100}%`,
    width: `${text.width * 100}%`,
    textAlign: text.align,
  } as const;
  const creditPosition =
    template.attribution.side === "right"
      ? {
          right: `${margin}%`,
          bottom: `calc(${margin}% + ${toCqMin(ATTRIBUTION_FONT_BASE_PX) * 1.25}cqmin)`,
          textAlign: "right" as const,
        }
      : template.attribution.side === "stacked-left"
        ? {
            left: `${margin}%`,
            bottom: `calc(${margin}% + ${toCqMin(ATTRIBUTION_FONT_BASE_PX) * 1.25}cqmin)`,
            textAlign: "left" as const,
          }
        : {
            left: `${margin}%`,
            bottom: `${margin}%`,
            textAlign: "left" as const,
          };

  return (
    <div className="poster-text-overlay" style={{ color: textColor }}>
      {template.frame.type !== "none" ? (
        <div
          className={`poster-template-frame poster-template-frame--${template.frame.type}`}
          style={{
            inset: `${template.frame.inset * 100}%`,
            borderColor: withAlpha(textColor, template.frame.alpha),
          }}
        />
      ) : null}

      {showPosterText && (
        <>
          {text.panel ? (
            <div
              className="poster-template-panel"
              style={{
                left: `${text.panel.x * 100}%`,
                top: `${text.panel.y * 100}%`,
                width: `${text.panel.width * 100}%`,
                height: `${text.panel.height * 100}%`,
                backgroundColor: withAlpha(landColor, text.panel.alpha),
                borderColor: withAlpha(textColor, 0.22),
              }}
            />
          ) : null}

          <p
            className="poster-city"
            style={{
              fontFamily: titleFont,
              top: `${text.cityY * 100}%`,
              fontSize: cityFontSize,
              ...textBoxStyle,
            }}
          >
            {cityLabel}
          </p>

          {text.showDivider ? (
            <hr
              className="poster-divider"
              style={{
                borderColor: textColor,
                top: `${(text.dividerY ?? text.countryY) * 100}%`,
                left: `${(text.dividerStart ?? 0.4) * 100}%`,
                right: `${(1 - (text.dividerEnd ?? 0.6)) * 100}%`,
              }}
            />
          ) : null}

          <p
            className="poster-country"
            style={{
              fontFamily: titleFont,
              top: `${text.countryY * 100}%`,
              fontSize: countryFontSize,
              ...textBoxStyle,
            }}
          >
            {country.toUpperCase()}
          </p>

          <p
            className="poster-coords"
            style={{
              fontFamily: bodyFont,
              top: `${text.coordsY * 100}%`,
              fontSize: coordsFontSize,
              ...textBoxStyle,
            }}
          >
            {formatCoordinates(lat, lon)}
          </p>
        </>
      )}

      <span
        className="poster-attribution"
        style={{
          ...attributionBaseStyle,
          bottom: `${margin}%`,
          right: `${margin}%`,
        }}
      >
        &copy; OpenStreetMap contributors
      </span>

      {includeCredits && (
        <span
          className="poster-credits"
          style={{
            ...attributionBaseStyle,
            ...creditPosition,
          }}
        >
          &copy; {APP_CREDIT_URL}
        </span>
      )}
    </div>
  );
}
