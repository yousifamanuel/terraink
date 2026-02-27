import { clamp } from "@/shared/geo/math";
import { parseNumericInput } from "@/shared/utils/number";

export interface ValidationConfig {
  minPosterCm: number;
  maxPosterCm: number;
  minDistanceMeters: number;
  maxDistanceMeters: number;
}

export interface ValidatedInput {
  locationText: string;
  latText: string;
  lonText: string;
  widthCm: number;
  heightCm: number;
  widthInches: number;
  heightInches: number;
  distanceMeters: number;
  hasManualCoordinates: boolean;
}

const CM_PER_INCH = 2.54;

export function validatePosterInput(
  form: {
    location: string;
    latitude: string;
    longitude: string;
    width: string;
    height: string;
    distance: string;
  },
  config: ValidationConfig,
): ValidatedInput {
  const locationText = form.location.trim();
  const latText = form.latitude.trim();
  const lonText = form.longitude.trim();
  const hasManualCoordinates = Boolean(latText && lonText);

  if (!locationText && (latText || lonText) && !hasManualCoordinates) {
    throw new Error(
      "When location is empty, both latitude and longitude are required.",
    );
  }

  if (!locationText && !hasManualCoordinates) {
    throw new Error(
      "Location is required unless both latitude and longitude are provided.",
    );
  }

  const widthCm = clamp(
    parseNumericInput("Width", form.width),
    config.minPosterCm,
    config.maxPosterCm,
  );
  const heightCm = clamp(
    parseNumericInput("Height", form.height),
    config.minPosterCm,
    config.maxPosterCm,
  );
  const widthInches = widthCm / CM_PER_INCH;
  const heightInches = heightCm / CM_PER_INCH;
  const distanceMeters = clamp(
    parseNumericInput("Distance", form.distance),
    config.minDistanceMeters,
    config.maxDistanceMeters,
  );

  return {
    locationText,
    latText,
    lonText,
    widthCm,
    heightCm,
    widthInches,
    heightInches,
    distanceMeters,
    hasManualCoordinates,
  };
}
