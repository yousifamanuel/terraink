import { formatCoordinates } from "@/shared/geo/posterBounds";
import { APP_CREDIT_URL } from "@/core/config";
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
  formatCityLabel,
} from "@/features/poster/domain/textLayout";

interface PosterTextOverlayProps {
  city: string;
  country: string;
  lat: number;
  lon: number;
  fontFamily: string;
  textColor: string;
  showPosterText: boolean;
  includeCredits: boolean;
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
  showPosterText,
  includeCredits,
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
  const cityBaseSize = toCqMin(CITY_FONT_BASE_PX);
  const cityMinSize = toCqMin(CITY_FONT_MIN_PX);
  const cityFontSize =
    cityLen > CITY_TEXT_SHRINK_THRESHOLD
      ? `${Math.max(cityMinSize, cityBaseSize * (CITY_TEXT_SHRINK_THRESHOLD / cityLen))}cqmin`
      : `${cityBaseSize}cqmin`;

  const countryFontSize = `${toCqMin(COUNTRY_FONT_BASE_PX)}cqmin`;
  const coordsFontSize = `${toCqMin(COORDS_FONT_BASE_PX)}cqmin`;
  const attributionFontSize = `${toCqMin(ATTRIBUTION_FONT_BASE_PX)}cqmin`;

  return (
    <div className="poster-text-overlay" style={{ color: textColor }}>
      {showPosterText && (
        <>
          <p
            className="poster-city"
            style={{
              fontFamily: titleFont,
              top: `${TEXT_CITY_Y_RATIO * 100}%`,
              fontSize: cityFontSize,
            }}
          >
            {cityLabel}
          </p>
          <hr
            className="poster-divider"
            style={{
              borderColor: textColor,
              top: `${TEXT_DIVIDER_Y_RATIO * 100}%`,
            }}
          />
          <p
            className="poster-country"
            style={{
              fontFamily: titleFont,
              top: `${TEXT_COUNTRY_Y_RATIO * 100}%`,
              fontSize: countryFontSize,
            }}
          >
            {country.toUpperCase()}
          </p>
          <p
            className="poster-coords"
            style={{
              fontFamily: bodyFont,
              top: `${TEXT_COORDS_Y_RATIO * 100}%`,
              fontSize: coordsFontSize,
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
            fontSize: attributionFontSize,
            bottom: `${TEXT_EDGE_MARGIN_RATIO * 100}%`,
            left: `${TEXT_EDGE_MARGIN_RATIO * 100}%`,
          }}
        >
          created with {APP_CREDIT_URL}
        </span>
      )}
    </div>
  );
}
