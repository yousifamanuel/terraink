import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import type { MapInstanceRef } from "@/features/map/domain/types";
import type { MarkerStyle } from "../domain/types";
import { createMarkerDomElement } from "../domain/markerShapes";

interface UseMapMarkerOptions {
    mapRef: MapInstanceRef;
    show: boolean;
    center: [number, number] | undefined;
    style: MarkerStyle;
    color: string;
    size: number;
}

/**
 * Manages a single MapLibre marker on the map.
 *
 * Creates, updates, and removes the marker element in response to
 * configuration changes. Cleans up on unmount.
 */
export function useMapMarker({
    mapRef,
    show,
    center,
    style,
    color,
    size,
}: UseMapMarkerOptions): void {
    const markerRef = useRef<maplibregl.Marker | null>(null);

    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        // Remove existing marker
        if (markerRef.current) {
            markerRef.current.remove();
            markerRef.current = null;
        }

        if (show && center) {
            const el = createMarkerDomElement(style, color, size);
            const anchor = style === "pin" ? "bottom" : "center";

            markerRef.current = new maplibregl.Marker({ element: el, anchor })
                .setLngLat(center)
                .addTo(map);
        }

        return () => {
            if (markerRef.current) {
                markerRef.current.remove();
                markerRef.current = null;
            }
        };
    }, [show, center?.[0], center?.[1], color, style, size, mapRef]);
}
