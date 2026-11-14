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
  computeCityFontScale,
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
  /** Pre-formatted coordinates; "" hides them. */
  coordinateText?: string;
  includeCredits: boolean;
  showOverlay: boolean;
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
  coordinateText,
  includeCredits,
  showOverlay,
}: PosterTextOverlayProps) {
  const toCqMin = (px: number) => (px / TEXT_DIMENSION_REFERENCE_PX) * 100;

  const titleFont = fontFamily
    ? `"${fontFamily}", "Space Grotesk", sans-serif`
    : '"Space Grotesk", sans-serif';
  const bodyFont = fontFamily
    ? `"${fontFamily}", "IBM Plex Mono", monospace`
    : '"IBM Plex Mono", monospace';

  const cityLabel = formatCityLabel(city);
  const cityFontSize = `${toCqMin(CITY_FONT_BASE_PX) * computeCityFontScale(city)}cqmin`;
  const countryFontSize = `${toCqMin(COUNTRY_FONT_BASE_PX)}cqmin`;
  const coordsFontSize = `${toCqMin(COORDS_FONT_BASE_PX)}cqmin`;
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
          {coordinateText !== "" ? (
            <p
              className="poster-coords"
              style={{
                fontFamily: bodyFont,
                top: `${TEXT_COORDS_Y_RATIO * 100}%`,
                fontSize: coordsFontSize,
              }}
            >
              {coordinateText ?? formatCoordinates(lat, lon)}
            </p>
          ) : null}
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
        &copy; OpenStreetMap
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
