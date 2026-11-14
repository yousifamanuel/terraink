/** How the poster writes coordinates. */
export type CoordinateFormat = "nsew" | "signed" | "dms";

export const COORDINATE_FORMATS: CoordinateFormat[] = ["nsew", "signed", "dms"];

/** Ready-made separators, in button order; "" = none. */
export const COORDINATE_SEPARATORS = ["/", "–", ",", ";", "·", "|", ""];

/** Longest separator a user can type. */
export const MAX_COORDINATE_SEPARATOR_LENGTH = 3;

export interface CoordinateTextOptions {
  format?: CoordinateFormat;
  /** Text between latitude and longitude; "" = just a space. */
  separator?: string;
}

/** Degrees, minutes, seconds: 52°22′33″ */
function toDms(value: number): string {
  const abs = Math.abs(value);
  let degrees = Math.floor(abs);
  let minutes = Math.floor((abs - degrees) * 60);
  let seconds = Math.round(((abs - degrees) * 60 - minutes) * 60);
  if (seconds === 60) {
    seconds = 0;
    minutes += 1;
  }
  if (minutes === 60) {
    minutes = 0;
    degrees += 1;
  }
  return `${degrees}°${minutes}′${seconds}″`;
}

/** "/" → " / ", "," → ", ", "" → " " */
function joinWith(separator: string): string {
  const sep = separator.trim();
  if (!sep) return " ";
  return sep === "," || sep === ";" ? `${sep} ` : ` ${sep} `;
}

export function formatCoordinates(
  lat: number,
  lon: number,
  { format = "nsew", separator = "/" }: CoordinateTextOptions = {},
): string {
  const ns = lat >= 0 ? "N" : "S";
  const ew = lon >= 0 ? "E" : "W";
  const parts =
    format === "signed"
      ? [lat.toFixed(4), lon.toFixed(4)]
      : format === "dms"
        ? [`${toDms(lat)} ${ns}`, `${toDms(lon)} ${ew}`]
        : [`${Math.abs(lat).toFixed(4)}° ${ns}`, `${Math.abs(lon).toFixed(4)}° ${ew}`];
  return parts.join(joinWith(separator));
}
