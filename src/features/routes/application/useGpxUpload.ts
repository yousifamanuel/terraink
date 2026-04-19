import { useCallback } from "react";
import { usePosterContext } from "@/features/poster/ui/PosterContext";
import { gpxParser } from "@/core/services";
import { MAX_GPX_FILE_SIZE_BYTES } from "@/features/routes/domain/constants";
import type { Route, RouteBounds } from "@/features/routes/domain/types";
import {
  boundsCenter,
  boundsHalfWidthMeters,
  combinedRoutesBounds,
  createRoute,
  getGpxUploadLabel,
  readFileAsText,
  routeBounds,
} from "@/features/routes/infrastructure/helpers";

const MAX_COMBINED_HALF_WIDTH_METERS = 500_000;

export type UploadGpxResult =
  | { status: "added" }
  | {
      status: "needs-confirmation";
      pendingRoute: Route;
      newBounds: RouteBounds;
      combinedHalfWidthMeters: number;
    };

interface UseGpxUploadResult {
  uploadGpxFile: (file: File) => Promise<UploadGpxResult>;
  confirmAddRoute: (pendingRoute: Route, newBounds: RouteBounds) => void;
  confirmReplaceRoutes: (pendingRoute: Route, newBounds: RouteBounds) => void;
}

function isGpxFile(file: File): boolean {
  if (file.name.toLowerCase().endsWith(".gpx")) return true;
  if (file.type === "application/gpx+xml") return true;
  return false;
}

export function useGpxUpload(): UseGpxUploadResult {
  const { state, dispatch } = usePosterContext();
  const { routes, routeDefaults, form } = state;

  const fitBoundsToForm = useCallback(
    (bounds: RouteBounds) => {
      const center = boundsCenter(bounds);
      const halfWidth = boundsHalfWidthMeters(bounds);
      if (!Number.isFinite(halfWidth) || halfWidth <= 0) return;
      dispatch({
        type: "SET_FORM_FIELDS",
        fields: {
          latitude: center.lat.toFixed(6),
          longitude: center.lon.toFixed(6),
          distance: String(Math.round(halfWidth)),
        },
      });
    },
    [dispatch],
  );

  const uploadGpxFile = useCallback(
    async (file: File): Promise<UploadGpxResult> => {
      if (!isGpxFile(file)) {
        throw new Error("Please upload a .gpx file.");
      }
      if (file.size > MAX_GPX_FILE_SIZE_BYTES) {
        throw new Error("GPX file is too large (max 10 MB).");
      }

      const text = await readFileAsText(file);
      const parsed = gpxParser.parse(text, getGpxUploadLabel(file.name));

      const pendingRoute = createRoute({
        parsed,
        defaults: routeDefaults,
        source: "gpx",
        label: getGpxUploadLabel(file.name),
        sourceFilename: file.name,
      });

      if (routes.length === 0) {
        dispatch({ type: "ADD_ROUTE", route: pendingRoute });
        fitBoundsToForm(parsed.bounds);
        return { status: "added" };
      }

      const combined = combinedRoutesBounds(routes, parsed.bounds);
      if (!combined) {
        dispatch({ type: "ADD_ROUTE", route: pendingRoute });
        return { status: "added" };
      }

      const combinedHalfWidth = boundsHalfWidthMeters(combined);
      if (combinedHalfWidth > MAX_COMBINED_HALF_WIDTH_METERS) {
        throw new Error(
          "This route is too far from your existing routes. Remove or replace them first.",
        );
      }

      const currentDistance = Number(form.distance) || 0;
      const firstBounds = routeBounds(routes[0]!);
      const firstHalfWidth = firstBounds ? boundsHalfWidthMeters(firstBounds) : 0;
      const threshold = Math.max(currentDistance * 2, firstHalfWidth * 2);

      if (threshold > 0 && combinedHalfWidth > threshold) {
        return {
          status: "needs-confirmation",
          pendingRoute,
          newBounds: parsed.bounds,
          combinedHalfWidthMeters: combinedHalfWidth,
        };
      }

      dispatch({ type: "ADD_ROUTE", route: pendingRoute });
      fitBoundsToForm(combined);
      return { status: "added" };
    },
    [dispatch, fitBoundsToForm, form.distance, routeDefaults, routes],
  );

  const confirmAddRoute = useCallback(
    (pendingRoute: Route, newBounds: RouteBounds) => {
      dispatch({ type: "ADD_ROUTE", route: pendingRoute });
      const combined = combinedRoutesBounds(routes, newBounds);
      if (combined) fitBoundsToForm(combined);
    },
    [dispatch, fitBoundsToForm, routes],
  );

  const confirmReplaceRoutes = useCallback(
    (pendingRoute: Route, newBounds: RouteBounds) => {
      dispatch({ type: "REPLACE_ROUTES", routes: [pendingRoute] });
      fitBoundsToForm(newBounds);
    },
    [dispatch, fitBoundsToForm],
  );

  return { uploadGpxFile, confirmAddRoute, confirmReplaceRoutes };
}
