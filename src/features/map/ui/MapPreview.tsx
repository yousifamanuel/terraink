import { useEffect, useRef, type CSSProperties } from "react";
import maplibregl from "maplibre-gl";
import type { LayerSpecification, StyleSpecification } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { MapInstanceRef } from "@/features/map/domain/types";
import {
  MAP_CENTER_SYNC_EPSILON,
  MAP_ZOOM_SYNC_EPSILON,
  MAP_BEARING_SYNC_EPSILON,
} from "@/features/map/infrastructure";

/**
 * Apply style changes incrementally via setPaintProperty / setLayoutProperty
 * instead of calling setStyle() which triggers a full style diff.
 */
function applyIncrementalStyleUpdate(
  map: maplibregl.Map,
  prev: StyleSpecification,
  next: StyleSpecification,
): void {
  const prevLayerMap = new Map(
    prev.layers.map((l) => [l.id, l] as [string, LayerSpecification]),
  );

  for (const layer of next.layers) {
    const prevLayer = prevLayerMap.get(layer.id);
    if (!prevLayer) continue;

    // Diff paint properties
    const nextPaint = (layer as Record<string, unknown>).paint as
      | Record<string, unknown>
      | undefined;
    const prevPaint = (prevLayer as Record<string, unknown>).paint as
      | Record<string, unknown>
      | undefined;
    if (nextPaint) {
      for (const key of Object.keys(nextPaint)) {
        if (JSON.stringify(nextPaint[key]) !== JSON.stringify(prevPaint?.[key])) {
          map.setPaintProperty(layer.id, key, nextPaint[key]);
        }
      }
    }

    // Diff layout properties
    const nextLayout = (layer as Record<string, unknown>).layout as
      | Record<string, unknown>
      | undefined;
    const prevLayout = (prevLayer as Record<string, unknown>).layout as
      | Record<string, unknown>
      | undefined;
    if (nextLayout) {
      for (const key of Object.keys(nextLayout)) {
        if (
          JSON.stringify(nextLayout[key]) !== JSON.stringify(prevLayout?.[key])
        ) {
          map.setLayoutProperty(layer.id, key, nextLayout[key]);
        }
      }
    }

    // Diff minzoom / maxzoom
    const nextAny = layer as Record<string, unknown>;
    const prevAny = prevLayer as Record<string, unknown>;
    if (nextAny.minzoom !== prevAny.minzoom || nextAny.maxzoom !== prevAny.maxzoom) {
      map.setLayerZoomRange(
        layer.id,
        (nextAny.minzoom as number) ?? 0,
        (nextAny.maxzoom as number) ?? 24,
      );
    }
  }
}

interface MapPreviewProps {
  style: StyleSpecification;
  center: [lon: number, lat: number];
  zoom: number;
  bearing?: number;
  mapRef: MapInstanceRef;
  interactive?: boolean;
  allowRotation?: boolean;
  minZoom?: number;
  maxZoom?: number;
  onMoveEnd?: (center: [number, number], zoom: number) => void;
  onMove?: (center: [number, number], zoom: number) => void;
  containerStyle?: CSSProperties;
  overzoomScale?: number;
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
  bearing = 0,
  mapRef,
  interactive = false,
  allowRotation = false,
  minZoom,
  maxZoom,
  onMoveEnd,
  onMove,
  containerStyle,
  overzoomScale = 1,
}: MapPreviewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isSyncing = useRef(false);
  const hasMountedStyleRef = useRef(false);
  const prevStyleRef = useRef<StyleSpecification | null>(null);
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

    // Tell MapLibre to re-measure its canvas whenever the container resizes.
    // On mobile the container may start at 0 / partial size while CSS
    // aspect-ratio is still being resolved, so the initial render can be
    // blank.  This observer ensures the map repaints once the real
    // dimensions are known.
    const resizeObserver = new ResizeObserver(() => {
      map.resize();
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
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

    // Initial style is already provided in map constructor — record it and skip.
    if (!hasMountedStyleRef.current) {
      hasMountedStyleRef.current = true;
      prevStyleRef.current = style;
      return;
    }

    // If the map hasn't finished loading the initial style yet, queue a full setStyle.
    if (!map.isStyleLoaded()) {
      const applyWhenReady = () => {
        map.setStyle(style);
        prevStyleRef.current = style;
      };
      map.once("load", applyWhenReady);
      return () => {
        map.off("load", applyWhenReady);
      };
    }

    // Fast path: apply only the changed paint/layout/zoom properties directly,
    // avoiding a full setStyle diff and any risk of source re-initialisation.
    if (
      prevStyleRef.current &&
      JSON.stringify(prevStyleRef.current.sources) ===
        JSON.stringify(style.sources)
    ) {
      applyIncrementalStyleUpdate(map, prevStyleRef.current, style);
    } else {
      map.setStyle(style);
    }

    prevStyleRef.current = style;
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
    const bearingDelta = Math.abs(map.getBearing() - bearing);

    if (
      centerDelta < MAP_CENTER_SYNC_EPSILON &&
      zoomDelta < MAP_ZOOM_SYNC_EPSILON &&
      bearingDelta < MAP_BEARING_SYNC_EPSILON
    ) {
      return;
    }

    isSyncing.current = true;
    map.jumpTo({ center, zoom, bearing });
    requestAnimationFrame(() => {
      isSyncing.current = false;
    });
  }, [center, zoom, bearing, mapRef]);

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
