import type { Coordinate } from "@/shared/geo/types";
import type { IGpxParserPort } from "../domain/ports";
import type { ParsedGpx, RouteBounds } from "../domain/types";

function deriveLabelFromGpx(doc: Document, fallback: string): string {
  const nameNode = doc.querySelector("trk > name")
    ?? doc.querySelector("metadata > name")
    ?? doc.querySelector("name");
  const raw = nameNode?.textContent?.trim();
  return raw && raw.length > 0 ? raw : fallback;
}

function parseSegments(doc: Document): Coordinate[][] {
  const segmentNodes = Array.from(doc.getElementsByTagName("trkseg"));
  const segments: Coordinate[][] = [];

  for (const seg of segmentNodes) {
    const pointNodes = Array.from(seg.getElementsByTagName("trkpt"));
    const points: Coordinate[] = [];
    for (const pt of pointNodes) {
      const lat = Number(pt.getAttribute("lat"));
      const lon = Number(pt.getAttribute("lon"));
      if (Number.isFinite(lat) && Number.isFinite(lon)) {
        points.push({ lat, lon });
      }
    }
    if (points.length >= 2) {
      segments.push(points);
    }
  }

  return segments;
}

function computeBounds(segments: Coordinate[][]): RouteBounds {
  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLon = Infinity;
  let maxLon = -Infinity;

  for (const seg of segments) {
    for (const { lat, lon } of seg) {
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
      if (lon < minLon) minLon = lon;
      if (lon > maxLon) maxLon = lon;
    }
  }

  return { minLat, maxLat, minLon, maxLon };
}

export const gpxParser: IGpxParserPort = {
  parse(xml, fallbackLabel = "Track") {
    const doc = new DOMParser().parseFromString(xml, "application/xml");
    if (doc.getElementsByTagName("parsererror").length > 0) {
      throw new Error("Could not read GPX file — the XML is invalid.");
    }

    const segments = parseSegments(doc);
    if (segments.length === 0) {
      throw new Error("No track points found in GPX file.");
    }

    const pointCount = segments.reduce((sum, seg) => sum + seg.length, 0);
    const label = deriveLabelFromGpx(doc, fallbackLabel);
    const bounds = computeBounds(segments);

    return { label, segments, bounds, pointCount } satisfies ParsedGpx;
  },
};
