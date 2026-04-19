import { useCallback } from "react";
import { usePosterContext } from "@/features/poster/ui/PosterContext";
import { gpxParser } from "@/core/services";
import { MAX_GPX_FILE_SIZE_BYTES } from "@/features/routes/domain/constants";
import {
  boundsCenter,
  boundsHalfWidthMeters,
  createGpxTrack,
  getGpxUploadLabel,
  readFileAsText,
} from "@/features/routes/infrastructure/helpers";

interface UseGpxUploadResult {
  uploadGpxFile: (file: File) => Promise<void>;
}

function isGpxFile(file: File): boolean {
  if (file.name.toLowerCase().endsWith(".gpx")) return true;
  if (file.type === "application/gpx+xml") return true;
  return false;
}

export function useGpxUpload(): UseGpxUploadResult {
  const { state, dispatch } = usePosterContext();

  const uploadGpxFile = useCallback(
    async (file: File) => {
      if (!isGpxFile(file)) {
        throw new Error("Please upload a .gpx file.");
      }
      if (file.size > MAX_GPX_FILE_SIZE_BYTES) {
        throw new Error("GPX file is too large (max 10 MB).");
      }

      const text = await readFileAsText(file);
      const parsed = gpxParser.parse(text, getGpxUploadLabel(file.name));

      const track = createGpxTrack({
        parsed,
        defaults: state.gpxDefaults,
        label: getGpxUploadLabel(file.name),
      });

      dispatch({ type: "ADD_GPX_TRACK", track });

      const center = boundsCenter(parsed.bounds);
      const halfWidth = boundsHalfWidthMeters(parsed.bounds);
      if (Number.isFinite(halfWidth) && halfWidth > 0) {
        dispatch({
          type: "SET_FORM_FIELDS",
          fields: {
            latitude: center.lat.toFixed(6),
            longitude: center.lon.toFixed(6),
            distance: String(Math.round(halfWidth)),
          },
        });
      }
    },
    [dispatch, state.gpxDefaults],
  );

  return { uploadGpxFile };
}
