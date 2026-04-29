import { useEffect, useMemo, useState, type CSSProperties } from "react";
import type { MapInstanceRef } from "@/features/map/domain/types";
import type { Route } from "@/features/routes/domain/types";
import type { MarkerIconDefinition } from "@/features/markers/domain/types";
import { findMarkerIcon } from "@/features/markers/infrastructure/iconRegistry";
import MarkerVisual from "@/features/markers/ui/MarkerVisual";
import { routeEndpoints } from "@/features/routes/infrastructure/helpers";

interface RouteEndpointsOverlayProps {
  routes: Route[];
  customIcons: MarkerIconDefinition[];
  mapRef: MapInstanceRef;
  visible: boolean;
  overzoomScale: number;
}

export default function RouteEndpointsOverlay({
  routes,
  customIcons,
  mapRef,
  visible,
  overzoomScale,
}: RouteEndpointsOverlayProps) {
  const [renderTick, setRenderTick] = useState(0);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const sync = () => setRenderTick((value) => value + 1);

    map.on("move", sync);
    map.on("moveend", sync);
    map.on("rotate", sync);
    map.on("resize", sync);
    map.on("load", sync);

    return () => {
      map.off("move", sync);
      map.off("moveend", sync);
      map.off("rotate", sync);
      map.off("resize", sync);
      map.off("load", sync);
    };
  }, [mapRef]);

  const map = mapRef.current;
  const projected = useMemo(() => {
    if (!map || !visible) return [];
    return routes.flatMap((route) => {
      if (!route.showEndpoints) return [];
      const endpoints = routeEndpoints(route);
      if (!endpoints) return [];
      const items: {
        key: string;
        x: number;
        y: number;
        icon: MarkerIconDefinition;
        color: string;
        size: number;
      }[] = [];
      const projectPoint = (lat: number, lon: number) => {
        try {
          const p = map.project([lon, lat]);
          return { x: p.x / overzoomScale, y: p.y / overzoomScale };
        } catch {
          return null;
        }
      };
      const startIcon = findMarkerIcon(route.startMarker.iconId, customIcons);
      if (startIcon) {
        const p = projectPoint(endpoints.start.lat, endpoints.start.lon);
        if (p) {
          items.push({
            key: `${route.id}-start`,
            x: p.x,
            y: p.y,
            icon: startIcon,
            color: route.startMarker.color,
            size: route.startMarker.size,
          });
        }
      }
      const finishIcon = findMarkerIcon(route.finishMarker.iconId, customIcons);
      if (finishIcon) {
        const p = projectPoint(endpoints.finish.lat, endpoints.finish.lon);
        if (p) {
          items.push({
            key: `${route.id}-finish`,
            x: p.x,
            y: p.y,
            icon: finishIcon,
            color: route.finishMarker.color,
            size: route.finishMarker.size,
          });
        }
      }
      return items;
    });
    // renderTick drives recomputation when the map view changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, routes, customIcons, visible, overzoomScale, renderTick]);

  if (!visible || projected.length === 0) {
    return null;
  }

  return (
    <div className="poster-route-endpoints" aria-hidden="true">
      {projected.map(({ key, x, y, icon, color, size }) => (
        <div
          key={key}
          className="poster-route-endpoint"
          style={{ left: `${x}px`, top: `${y}px` } as CSSProperties}
        >
          <MarkerVisual icon={icon} size={size} color={color} />
        </div>
      ))}
    </div>
  );
}
