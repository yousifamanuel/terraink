import { formatCoordinates } from "../geo";

export function isLatinScript(text) {
  if (!text) {
    return true;
  }

  let latinCount = 0;
  let alphaCount = 0;

  for (const char of text) {
    if (/[A-Za-z\u00C0-\u024F]/.test(char)) {
      latinCount += 1;
      alphaCount += 1;
    } else if (/\p{L}/u.test(char)) {
      alphaCount += 1;
    }
  }

  if (alphaCount === 0) {
    return true;
  }

  return latinCount / alphaCount > 0.8;
}

export function drawPosterText(
  ctx,
  width,
  height,
  theme,
  center,
  city,
  country,
  fontFamily,
) {
  const textColor = theme.text || "#111111";
  const titleFontFamily = fontFamily
    ? `"${fontFamily}", "Space Grotesk", sans-serif`
    : '"Space Grotesk", sans-serif';
  const bodyFontFamily = fontFamily
    ? `"${fontFamily}", "IBM Plex Mono", monospace`
    : '"IBM Plex Mono", monospace';

  const dimScale = Math.max(0.45, Math.min(width, height) / 3600);

  const cityLabel = isLatinScript(city) ? city.toUpperCase().split("").join("  ") : city;
  const cityLength = Math.max(city.length, 1);

  let cityFontSize = 250 * dimScale;
  if (cityLength > 10) {
    cityFontSize = Math.max(110 * dimScale, cityFontSize * (10 / cityLength));
  }

  const countryFontSize = 92 * dimScale;
  const coordinateFontSize = 58 * dimScale;
  const attributionFontSize = 30 * dimScale;

  const cityY = height * 0.845;
  const lineY = height * 0.875;
  const countryY = height * 0.9;
  const coordinatesY = height * 0.93;

  ctx.fillStyle = textColor;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `700 ${cityFontSize}px ${titleFontFamily}`;
  ctx.fillText(cityLabel, width * 0.5, cityY);

  ctx.strokeStyle = textColor;
  ctx.lineWidth = 3 * dimScale;
  ctx.beginPath();
  ctx.moveTo(width * 0.4, lineY);
  ctx.lineTo(width * 0.6, lineY);
  ctx.stroke();

  ctx.font = `300 ${countryFontSize}px ${titleFontFamily}`;
  ctx.fillText(country.toUpperCase(), width * 0.5, countryY);

  ctx.globalAlpha = 0.75;
  ctx.font = `400 ${coordinateFontSize}px ${bodyFontFamily}`;
  ctx.fillText(formatCoordinates(center.lat, center.lon), width * 0.5, coordinatesY);
  ctx.globalAlpha = 1;

  ctx.globalAlpha = 0.55;
  ctx.textAlign = "right";
  ctx.textBaseline = "bottom";
  ctx.font = `300 ${attributionFontSize}px ${bodyFontFamily}`;
  ctx.fillText("(c) OpenStreetMap contributors", width * 0.98, height * 0.98);
  ctx.globalAlpha = 1;
}
