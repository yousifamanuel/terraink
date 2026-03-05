import { useEffect, useRef, type CSSProperties } from "react";
import maplibregl from "maplibre-gl";
import type { StyleSpecification } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { MapInstanceRef } from "@/features/map/domain/types";
import type { MarkerStyle } from "@/features/poster/application/posterReducer";
import {
  MAP_CENTER_SYNC_EPSILON,
  MAP_ZOOM_SYNC_EPSILON,
} from "@/features/map/infrastructure";

function createMarkerElement(markerStyle: MarkerStyle, color: string, size: number = 40): HTMLDivElement {
  const el = document.createElement("div");
  el.style.width = `${size}px`;
  el.style.height = `${size}px`;
  el.style.cursor = "pointer";
  el.style.filter = "drop-shadow(0 2px 4px rgba(0,0,0,0.5))";

  const svgNs = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNs, "svg");
  svg.setAttribute("viewBox", "0 0 40 40");
  svg.setAttribute("width", String(size));
  svg.setAttribute("height", String(size));
  svg.style.overflow = "visible";

  switch (markerStyle) {
    case "pin": {
      // Drop pin shape — tall and pointy at bottom
      const pinW = Math.round(size * 0.75);
      const pinH = Math.round(size * 1.05);
      const pinEl = document.createElement("div");
      pinEl.style.width = `${pinW}px`;
      pinEl.style.height = `${pinH}px`;
      pinEl.style.cursor = "pointer";
      pinEl.style.filter = "drop-shadow(0 3px 5px rgba(0,0,0,0.5))";
      const pinSvg = document.createElementNS(svgNs, "svg");
      pinSvg.setAttribute("viewBox", "0 0 30 42");
      pinSvg.setAttribute("width", String(pinW));
      pinSvg.setAttribute("height", String(pinH));
      const path = document.createElementNS(svgNs, "path");
      path.setAttribute("d", "M15 0C6.716 0 0 6.716 0 15c0 10.5 15 27 15 27s15-16.5 15-27C30 6.716 23.284 0 15 0z");
      path.setAttribute("fill", color);
      path.setAttribute("stroke", "rgba(0,0,0,0.3)");
      path.setAttribute("stroke-width", "1.5");
      const innerCircle = document.createElementNS(svgNs, "circle");
      innerCircle.setAttribute("cx", "15");
      innerCircle.setAttribute("cy", "14");
      innerCircle.setAttribute("r", "6");
      innerCircle.setAttribute("fill", "rgba(0,0,0,0.25)");
      pinSvg.appendChild(path);
      pinSvg.appendChild(innerCircle);
      pinEl.appendChild(pinSvg);
      return pinEl;
    }
    case "circle": {
      const outer = document.createElementNS(svgNs, "circle");
      outer.setAttribute("cx", "20");
      outer.setAttribute("cy", "20");
      outer.setAttribute("r", "16");
      outer.setAttribute("fill", color);
      outer.setAttribute("stroke", "rgba(255,255,255,0.8)");
      outer.setAttribute("stroke-width", "3");
      const inner = document.createElementNS(svgNs, "circle");
      inner.setAttribute("cx", "20");
      inner.setAttribute("cy", "20");
      inner.setAttribute("r", "6");
      inner.setAttribute("fill", "rgba(255,255,255,0.9)");
      svg.appendChild(outer);
      svg.appendChild(inner);
      break;
    }
    case "target": {
      // Crosshair / target
      const outerRing = document.createElementNS(svgNs, "circle");
      outerRing.setAttribute("cx", "20");
      outerRing.setAttribute("cy", "20");
      outerRing.setAttribute("r", "16");
      outerRing.setAttribute("fill", "none");
      outerRing.setAttribute("stroke", color);
      outerRing.setAttribute("stroke-width", "3");
      const innerRing = document.createElementNS(svgNs, "circle");
      innerRing.setAttribute("cx", "20");
      innerRing.setAttribute("cy", "20");
      innerRing.setAttribute("r", "8");
      innerRing.setAttribute("fill", "none");
      innerRing.setAttribute("stroke", color);
      innerRing.setAttribute("stroke-width", "2");
      const dot = document.createElementNS(svgNs, "circle");
      dot.setAttribute("cx", "20");
      dot.setAttribute("cy", "20");
      dot.setAttribute("r", "3");
      dot.setAttribute("fill", color);
      // Cross lines
      const lines = [
        ["20", "0", "20", "7"],
        ["20", "33", "20", "40"],
        ["0", "20", "7", "20"],
        ["33", "20", "40", "20"],
      ];
      svg.appendChild(outerRing);
      svg.appendChild(innerRing);
      svg.appendChild(dot);
      for (const [x1, y1, x2, y2] of lines) {
        const line = document.createElementNS(svgNs, "line");
        line.setAttribute("x1", x1);
        line.setAttribute("y1", y1);
        line.setAttribute("x2", x2);
        line.setAttribute("y2", y2);
        line.setAttribute("stroke", color);
        line.setAttribute("stroke-width", "2");
        svg.appendChild(line);
      }
      break;
    }
    case "diamond": {
      const diamond = document.createElementNS(svgNs, "polygon");
      diamond.setAttribute("points", "20,2 38,20 20,38 2,20");
      diamond.setAttribute("fill", color);
      diamond.setAttribute("stroke", "rgba(255,255,255,0.8)");
      diamond.setAttribute("stroke-width", "2");
      const innerDiamond = document.createElementNS(svgNs, "polygon");
      innerDiamond.setAttribute("points", "20,10 30,20 20,30 10,20");
      innerDiamond.setAttribute("fill", "rgba(255,255,255,0.3)");
      svg.appendChild(diamond);
      svg.appendChild(innerDiamond);
      break;
    }
    case "star": {
      const star = document.createElementNS(svgNs, "polygon");
      // 5-point star
      const cx = 20, cy = 20, outerR = 18, innerR = 8;
      let points = "";
      for (let i = 0; i < 10; i++) {
        const r = i % 2 === 0 ? outerR : innerR;
        const angle = (Math.PI / 2) + (i * Math.PI) / 5;
        const x = cx + r * Math.cos(angle);
        const y = cy - r * Math.sin(angle);
        points += `${x.toFixed(1)},${y.toFixed(1)} `;
      }
      star.setAttribute("points", points.trim());
      star.setAttribute("fill", color);
      star.setAttribute("stroke", "rgba(255,255,255,0.8)");
      star.setAttribute("stroke-width", "1.5");
      svg.appendChild(star);
      break;
    }
  }

  el.appendChild(svg);
  return el;
}

interface MapPreviewProps {
  style: StyleSpecification;
  center: [lon: number, lat: number];
  zoom: number;
  mapRef: MapInstanceRef;
  interactive?: boolean;
  allowRotation?: boolean;
  minZoom?: number;
  maxZoom?: number;
  onMoveEnd?: (center: [number, number], zoom: number) => void;
  onMove?: (center: [number, number], zoom: number) => void;
  containerStyle?: CSSProperties;
  overzoomScale?: number;
  showMarker?: boolean;
  markerCenter?: [number, number];
  markerColor?: string;
  markerStyle?: MarkerStyle;
  markerSize?: number;
}

/**
 * MapLibre preview wrapper.
 *
 * - Keeps `preserveDrawingBuffer` enabled for export snapshots.
 * - Syncs controlled style/center/zoom from form state.
 * - Exposes full map instance via a shared ref for export/controls.
 */
export default function MapPreview({
  style,
  center,
  zoom,
  mapRef,
  interactive = false,
  allowRotation = false,
  minZoom,
  maxZoom,
  onMoveEnd,
  onMove,
  containerStyle,
  overzoomScale = 1,
  showMarker = false,
  markerCenter,
  markerColor = "#ffffff",
  markerStyle = "pin",
  markerSize = 40,
}: MapPreviewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isSyncing = useRef(false);
  const hasMountedStyleRef = useRef(false);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const onMoveEndRef = useRef(onMoveEnd);
  const onMoveRef = useRef(onMove);
  onMoveEndRef.current = onMoveEnd;
  onMoveRef.current = onMove;

  useEffect(() => {
    if (!containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style,
      center,
      zoom,
      interactive: false,
      attributionControl: false,
      canvasContextAttributes: { preserveDrawingBuffer: true },
    });

    mapRef.current = map;

    map.on("moveend", () => {
      if (isSyncing.current) return;
      const currentCenter = map.getCenter();
      onMoveEndRef.current?.([currentCenter.lng, currentCenter.lat], map.getZoom());
    });
    map.on("move", () => {
      if (isSyncing.current) return;
      const currentCenter = map.getCenter();
      onMoveRef.current?.([currentCenter.lng, currentCenter.lat], map.getZoom());
    });

    return () => {
      mapRef.current = null;
      map.remove();
    };
    // Mount once; follow-up updates are handled by effects below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (interactive) {
      map.scrollZoom.enable();
      map.dragPan.enable();
      map.touchZoomRotate.enable();
      map.doubleClickZoom.enable();
      map.keyboard.enable();
      if (allowRotation) {
        map.dragRotate.enable();
        map.touchZoomRotate.enableRotation();
      } else {
        map.dragRotate.disable();
        map.touchZoomRotate.disableRotation();
      }
    } else {
      map.scrollZoom.disable();
      map.dragPan.disable();
      map.touchZoomRotate.disable();
      map.doubleClickZoom.disable();
      map.keyboard.disable();
      map.touchZoomRotate.disableRotation();
      map.dragRotate.disable();
    }
  }, [interactive, allowRotation, mapRef]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (typeof minZoom === "number") {
      map.setMinZoom(minZoom);
    }
    if (typeof maxZoom === "number") {
      map.setMaxZoom(maxZoom);
    }
  }, [minZoom, maxZoom, mapRef]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Initial style is already provided in map constructor.
    // Skip the first effect pass to avoid "Style is not done loading" diffs.
    if (!hasMountedStyleRef.current) {
      hasMountedStyleRef.current = true;
      return;
    }

    if (map.isStyleLoaded()) {
      map.setStyle(style);
      return;
    }

    const applyStyleWhenReady = () => {
      map.setStyle(style);
    };

    map.once("load", applyStyleWhenReady);
    return () => {
      map.off("load", applyStyleWhenReady);
    };
  }, [style, mapRef]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const currentCenter = map.getCenter();
    const centerDelta = Math.max(
      Math.abs(currentCenter.lng - center[0]),
      Math.abs(currentCenter.lat - center[1]),
    );
    const zoomDelta = Math.abs(map.getZoom() - zoom);

    if (
      centerDelta < MAP_CENTER_SYNC_EPSILON &&
      zoomDelta < MAP_ZOOM_SYNC_EPSILON
    ) {
      return;
    }

    isSyncing.current = true;
    map.jumpTo({ center, zoom });
    requestAnimationFrame(() => {
      isSyncing.current = false;
    });
  }, [center, zoom, mapRef]);

  // ── Marker management ──
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove existing marker
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }

    if (showMarker && markerCenter) {
      const el = createMarkerElement(markerStyle, markerColor, markerSize);
      const anchor = markerStyle === "pin" ? "bottom" : "center";

      markerRef.current = new maplibregl.Marker({ element: el, anchor })
        .setLngLat(markerCenter)
        .addTo(map);
    }

    return () => {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
    };
  }, [showMarker, markerCenter?.[0], markerCenter?.[1], markerColor, markerStyle, markerSize, mapRef]);

  const normalizedOverzoomScale = Math.max(1, overzoomScale);
  const innerStyle: CSSProperties =
    normalizedOverzoomScale === 1
      ? { width: "100%", height: "100%" }
      : {
        width: `${normalizedOverzoomScale * 100}%`,
        height: `${normalizedOverzoomScale * 100}%`,
        transform: `scale(${1 / normalizedOverzoomScale})`,
        transformOrigin: "top left",
      };

  return (
    <div className="map-container" style={{ ...containerStyle, overflow: "hidden" }}>
      <div ref={containerRef} style={innerStyle} />
    </div>
  );
}
