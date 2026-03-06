import type { MarkerStyle } from "./types";
import {
    MARKER_VIEWBOX,
    PIN_VIEWBOX_WIDTH,
    PIN_VIEWBOX_HEIGHT,
    PIN_WIDTH_RATIO,
    PIN_HEIGHT_RATIO,
    PIN_STROKE_COLOR,
    PIN_STROKE_WIDTH,
    PIN_INNER_FILL,
    PIN_DROP_SHADOW,
    MARKER_DROP_SHADOW,
    OUTER_STROKE_COLOR,
    OUTER_STROKE_WIDTH,
    CIRCLE_INNER_FILL,
    DIAMOND_INNER_FILL,
    STAR_OUTER_RADIUS,
    STAR_INNER_RADIUS,
    STAR_STROKE_WIDTH,
    TARGET_OUTER_STROKE_WIDTH,
    TARGET_INNER_STROKE_WIDTH,
    TARGET_CROSSHAIR_STROKE_WIDTH,
    TARGET_OUTER_RADIUS,
    TARGET_INNER_RADIUS,
    TARGET_DOT_RADIUS,
} from "../infrastructure/constants";

/* ────────────────────────────────────────────────
 *  Pure SVG string builders — no DOM, no React.
 *  Used by both the map preview (via DOM helper below)
 *  and the export canvas pipeline.
 * ──────────────────────────────────────────────── */

function buildPinSvg(color: string, w: number, h: number): string {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${PIN_VIEWBOX_WIDTH} ${PIN_VIEWBOX_HEIGHT}" width="${w}" height="${h}">
    <path d="M15 0C6.716 0 0 6.716 0 15c0 10.5 15 27 15 27s15-16.5 15-27C30 6.716 23.284 0 15 0z" fill="${color}" stroke="${PIN_STROKE_COLOR}" stroke-width="${PIN_STROKE_WIDTH}"/>
    <circle cx="15" cy="14" r="6" fill="${PIN_INNER_FILL}"/>
  </svg>`;
}

function buildCircleSvg(color: string, size: number): string {
    const cx = MARKER_VIEWBOX / 2;
    const cy = MARKER_VIEWBOX / 2;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${MARKER_VIEWBOX} ${MARKER_VIEWBOX}" width="${size}" height="${size}">
    <circle cx="${cx}" cy="${cy}" r="16" fill="${color}" stroke="${OUTER_STROKE_COLOR}" stroke-width="${OUTER_STROKE_WIDTH}"/>
    <circle cx="${cx}" cy="${cy}" r="6" fill="${CIRCLE_INNER_FILL}"/>
  </svg>`;
}

function buildTargetSvg(color: string, size: number): string {
    const c = MARKER_VIEWBOX / 2;
    const gap = TARGET_OUTER_RADIUS + c - MARKER_VIEWBOX; // crosshair gap from edge
    const near = c - TARGET_OUTER_RADIUS + 3; // 7 from edge
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${MARKER_VIEWBOX} ${MARKER_VIEWBOX}" width="${size}" height="${size}">
    <circle cx="${c}" cy="${c}" r="${TARGET_OUTER_RADIUS}" fill="none" stroke="${color}" stroke-width="${TARGET_OUTER_STROKE_WIDTH}"/>
    <circle cx="${c}" cy="${c}" r="${TARGET_INNER_RADIUS}" fill="none" stroke="${color}" stroke-width="${TARGET_INNER_STROKE_WIDTH}"/>
    <circle cx="${c}" cy="${c}" r="${TARGET_DOT_RADIUS}" fill="${color}"/>
    <line x1="${c}" y1="0" x2="${c}" y2="${near}" stroke="${color}" stroke-width="${TARGET_CROSSHAIR_STROKE_WIDTH}"/>
    <line x1="${c}" y1="${MARKER_VIEWBOX - near}" x2="${c}" y2="${MARKER_VIEWBOX}" stroke="${color}" stroke-width="${TARGET_CROSSHAIR_STROKE_WIDTH}"/>
    <line x1="0" y1="${c}" x2="${near}" y2="${c}" stroke="${color}" stroke-width="${TARGET_CROSSHAIR_STROKE_WIDTH}"/>
    <line x1="${MARKER_VIEWBOX - near}" y1="${c}" x2="${MARKER_VIEWBOX}" y2="${c}" stroke="${color}" stroke-width="${TARGET_CROSSHAIR_STROKE_WIDTH}"/>
  </svg>`;
}

function buildDiamondSvg(color: string, size: number): string {
    const c = MARKER_VIEWBOX / 2;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${MARKER_VIEWBOX} ${MARKER_VIEWBOX}" width="${size}" height="${size}">
    <polygon points="${c},2 ${MARKER_VIEWBOX - 2},${c} ${c},${MARKER_VIEWBOX - 2} 2,${c}" fill="${color}" stroke="${OUTER_STROKE_COLOR}" stroke-width="2"/>
    <polygon points="${c},10 ${c + 10},${c} ${c},${c + 10} ${c - 10},${c}" fill="${DIAMOND_INNER_FILL}"/>
  </svg>`;
}

function buildStarSvg(color: string, size: number): string {
    const cx = MARKER_VIEWBOX / 2;
    const cy = MARKER_VIEWBOX / 2;
    let points = "";
    for (let i = 0; i < 10; i++) {
        const r = i % 2 === 0 ? STAR_OUTER_RADIUS : STAR_INNER_RADIUS;
        const angle = Math.PI / 2 + (i * Math.PI) / 5;
        const x = cx + r * Math.cos(angle);
        const y = cy - r * Math.sin(angle);
        points += `${x.toFixed(1)},${y.toFixed(1)} `;
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${MARKER_VIEWBOX} ${MARKER_VIEWBOX}" width="${size}" height="${size}">
    <polygon points="${points.trim()}" fill="${color}" stroke="${OUTER_STROKE_COLOR}" stroke-width="${STAR_STROKE_WIDTH}"/>
  </svg>`;
}

/* ── Public API ── */

/**
 * Build a marker SVG as a raw string.
 * Used by the export pipeline to draw markers onto a canvas element.
 */
export function buildMarkerSvgString(
    style: MarkerStyle,
    color: string,
    size: number,
): string {
    switch (style) {
        case "pin": {
            const w = Math.round(size * PIN_WIDTH_RATIO);
            const h = Math.round(size * PIN_HEIGHT_RATIO);
            return buildPinSvg(color, w, h);
        }
        case "circle":
            return buildCircleSvg(color, size);
        case "target":
            return buildTargetSvg(color, size);
        case "diamond":
            return buildDiamondSvg(color, size);
        case "star":
            return buildStarSvg(color, size);
    }
}

/**
 * Create an HTML element containing the marker SVG.
 * Used by MapLibre's `Marker({ element })` API for the live map preview.
 */
export function createMarkerDomElement(
    style: MarkerStyle,
    color: string,
    size: number,
): HTMLDivElement {
    const el = document.createElement("div");

    if (style === "pin") {
        const w = Math.round(size * PIN_WIDTH_RATIO);
        const h = Math.round(size * PIN_HEIGHT_RATIO);
        el.style.width = `${w}px`;
        el.style.height = `${h}px`;
        el.style.filter = PIN_DROP_SHADOW;
    } else {
        el.style.width = `${size}px`;
        el.style.height = `${size}px`;
        el.style.filter = MARKER_DROP_SHADOW;
    }

    el.style.cursor = "pointer";
    el.innerHTML = buildMarkerSvgString(style, color, size);

    return el;
}
