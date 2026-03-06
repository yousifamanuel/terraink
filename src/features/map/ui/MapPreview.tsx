import { useEffect, useRef, type CSSProperties } from "react";
import maplibregl from "maplibre-gl";
import type { StyleSpecification } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { MapInstanceRef } from "@/features/map/domain/types";
import {
  MAP_CENTER_SYNC_EPSILON,
  MAP_ZOOM_SYNC_EPSILON,
} from "@/features/map/infrastructure";

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
}

/**
 * MapLibre preview wrapper.
 *
 * - Keeps `preserveDrawingBuffer` enabled for export snapshots.
 * - Syncs controlled style/center/zoom from form state.
 * - Exposes full map instance via a shared ref for export/controls.
 *
 * Marker management has been moved to `useMapMarker` hook in the
 * marker feature module.
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
}: MapPreviewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isSyncing = useRef(false);
  const hasMountedStyleRef = useRef(false);
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
