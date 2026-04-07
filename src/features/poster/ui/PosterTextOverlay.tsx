import { formatCoordinates } from "@/shared/geo/posterBounds";
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
  formatCityLabel,
  computeAttributionColor,
} from "@/features/poster/domain/textLayout";

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
  textAlign?: 'left' | 'center' | 'right';
  textVerticalAlign?: 'top' | 'middle' | 'bottom';
  cityFontScale?: number;
  countryFontScale?: number;
  coordsFontScale?: number;
}

/**
 * DOM-based poster text overlay (sharp at any resolution, GPU-composited).
 * Renders city name, divider, country, coordinates, and attribution
 * positioned to match the canvas export layout exactly.
 */
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
  textAlign = 'center',
  textVerticalAlign = 'bottom',
  cityFontScale = 1,
  countryFontScale = 1,
  coordsFontScale = 1,
}: PosterTextOverlayProps) {
  const toCqMin = (px: number) => (px / TEXT_DIMENSION_REFERENCE_PX) * 100;

  const titleFont = fontFamily
    ? `"${fontFamily}", "Space Grotesk", sans-serif`
    : '"Space Grotesk", sans-serif';
  const bodyFont = fontFamily
    ? `"${fontFamily}", "IBM Plex Mono", monospace`
    : '"IBM Plex Mono", monospace';

  const cityLabel = formatCityLabel(city);

  const cityLen = Math.max(city.length, 1);
  const cityBaseSize = toCqMin(CITY_FONT_BASE_PX) * cityFontScale;
  const cityMinSize = toCqMin(CITY_FONT_MIN_PX) * cityFontScale;
  const cityFontSizeNum =
    cityLen > CITY_TEXT_SHRINK_THRESHOLD
      ? Math.max(cityMinSize, cityBaseSize * (CITY_TEXT_SHRINK_THRESHOLD / cityLen))
      : cityBaseSize;
  const cityFontSize = `${cityFontSizeNum}cqmin`;

  // Scale=1 city size, for computing how much extra space the scaled text needs
  const cityBaseScale1 = toCqMin(CITY_FONT_BASE_PX);
  const cityFontSizeScale1 =
    cityLen > CITY_TEXT_SHRINK_THRESHOLD
      ? Math.max(toCqMin(CITY_FONT_MIN_PX), cityBaseScale1 * (CITY_TEXT_SHRINK_THRESHOLD / cityLen))
      : cityBaseScale1;

  const countryFontSize = `${toCqMin(COUNTRY_FONT_BASE_PX) * countryFontScale}cqmin`;
  const coordsFontSize = `${toCqMin(COORDS_FONT_BASE_PX) * coordsFontScale}cqmin`;

  // Extra half-heights compared to scale=1, in cqmin — used to push divider/country/coords down
  const extraCityHalf = (cityFontSizeNum - cityFontSizeScale1) / 2;
  const extraCountryHalf = (countryFontScale - 1) * toCqMin(COUNTRY_FONT_BASE_PX) / 2;

  const blockMidRatio = (TEXT_CITY_Y_RATIO + TEXT_COORDS_Y_RATIO) / 2;
  const vOffsetPct =
    textVerticalAlign === 'top' ? ((1 - TEXT_COORDS_Y_RATIO) - TEXT_CITY_Y_RATIO) * 100 :
    textVerticalAlign === 'middle' ? (0.5 - blockMidRatio) * 100 :
    0;

  const dynTop = (base: number, cqminOffset: number) => {
    const pctPart = base * 100 + vOffsetPct;
    if (cqminOffset !== 0) return `calc(${pctPart}% + ${cqminOffset}cqmin)`;
    return `${pctPart}%`;
  };

  const edgePadding = `${TEXT_EDGE_MARGIN_RATIO * 2 * 100}%`;
  const alignStyle: React.CSSProperties =
    textAlign === 'left'
      ? { textAlign: 'left', paddingLeft: edgePadding, paddingRight: 0 }
      : textAlign === 'right'
      ? { textAlign: 'right', paddingLeft: 0, paddingRight: edgePadding }
      : { textAlign: 'center' };

  const dividerStyle: React.CSSProperties =
    textAlign === 'left'
      ? { left: edgePadding, right: '70%' }
      : textAlign === 'right'
      ? { left: '70%', right: edgePadding }
      : { left: '40%', right: '40%' };
  const attributionFontSize = `${toCqMin(ATTRIBUTION_FONT_BASE_PX)}cqmin`;
  const attributionColor = computeAttributionColor(textColor, landColor, showOverlay);
  const attributionOpacity = showOverlay ? 0.55 : 0.9;

  return (
    <div className="poster-text-overlay" style={{ color: textColor }}>
      {showPosterText && (
        <>
          <p
            className="poster-city"
            style={{
              fontFamily: titleFont,
              top: dynTop(TEXT_CITY_Y_RATIO, 0),
              fontSize: cityFontSize,
              ...alignStyle,
            }}
          >
            {cityLabel}
          </p>
          <hr
            className="poster-divider"
            style={{
              borderColor: textColor,
              top: dynTop(TEXT_DIVIDER_Y_RATIO, extraCityHalf),
              ...dividerStyle,
            }}
          />
          <p
            className="poster-country"
            style={{
              fontFamily: titleFont,
              top: dynTop(TEXT_COUNTRY_Y_RATIO, extraCityHalf),
              fontSize: countryFontSize,
              ...alignStyle,
            }}
          >
            {country.toUpperCase()}
          </p>
          <p
            className="poster-coords"
            style={{
              fontFamily: bodyFont,
              top: dynTop(TEXT_COORDS_Y_RATIO, extraCityHalf + extraCountryHalf),
              fontSize: coordsFontSize,
              ...alignStyle,
            }}
          >
            {formatCoordinates(lat, lon)}
          </p>
        </>
      )}

      <span
        className="poster-attribution"
        style={{
          fontFamily: bodyFont,
          color: attributionColor,
          opacity: attributionOpacity,
          fontSize: attributionFontSize,
          bottom: `${TEXT_EDGE_MARGIN_RATIO * 100}%`,
          right: `${TEXT_EDGE_MARGIN_RATIO * 100}%`,
        }}
      >
        &copy; OpenStreetMap contributors
      </span>

      {includeCredits && (
        <span
          className="poster-credits"
          style={{
            fontFamily: bodyFont,
            color: attributionColor,
            opacity: attributionOpacity,
            fontSize: attributionFontSize,
            bottom: `${TEXT_EDGE_MARGIN_RATIO * 100}%`,
            left: `${TEXT_EDGE_MARGIN_RATIO * 100}%`,
          }}
        >
          © {APP_CREDIT_URL}
        </span>
      )}
    </div>
  );
}
