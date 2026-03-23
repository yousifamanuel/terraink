import type { Locale } from "@/core/i18n/types";
import { translateMessage, translateStoredMessage } from "@/core/i18n/translate";

export type GeolocationFailureReason =
  | "denied"
  | "unavailable"
  | "timeout"
  | "unsupported"
  | "insecure"
  | "error";

export type GeolocationPermissionState = PermissionState | "unknown";

export type GeolocationRequestResult =
  | {
      ok: true;
      lat: number;
      lon: number;
      attempts: number;
      permissionState: GeolocationPermissionState;
    }
  | {
      ok: false;
      reason: GeolocationFailureReason;
      attempts: number;
      permissionState: GeolocationPermissionState;
    };

interface GeolocationRequestOptions {
  timeoutMs: number;
  maxAttempts?: number;
}

async function getPermissionState(): Promise<GeolocationPermissionState> {
  const permissionsApi = navigator.permissions;
  if (!permissionsApi || typeof permissionsApi.query !== "function") {
    return "unknown";
  }

  try {
    const status = await permissionsApi.query({
      name: "geolocation" as PermissionName,
    });
    return status.state;
  } catch {
    return "unknown";
  }
}

function getCurrentPosition(
  options: PositionOptions,
): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });
}

function mapGeolocationErrorToReason(error: GeolocationPositionError): GeolocationFailureReason {
  if (error.code === 1) return "denied";
  if (error.code === 2) return "unavailable";
  if (error.code === 3) return "timeout";
  return "error";
}

export async function requestCurrentPositionWithRetry({
  timeoutMs,
  maxAttempts = 2,
}: GeolocationRequestOptions): Promise<GeolocationRequestResult> {
  if (!("geolocation" in navigator)) {
    return {
      ok: false,
      reason: "unsupported",
      attempts: 0,
      permissionState: "unknown",
    };
  }

  if (!isSecureContext) {
    return {
      ok: false,
      reason: "insecure",
      attempts: 0,
      permissionState: "unknown",
    };
  }

  const permissionState = await getPermissionState();
  if (permissionState === "denied") {
    return {
      ok: false,
      reason: "denied",
      attempts: 0,
      permissionState,
    };
  }

  let attempts = 0;
  let lastReason: GeolocationFailureReason = "error";

  while (attempts < Math.max(1, maxAttempts)) {
    attempts += 1;
    try {
      const position = await getCurrentPosition({
        enableHighAccuracy: attempts > 1,
        timeout: timeoutMs,
        maximumAge: 0,
      });
      return {
        ok: true,
        lat: position.coords.latitude,
        lon: position.coords.longitude,
        attempts,
        permissionState,
      };
    } catch (error) {
      const reason = mapGeolocationErrorToReason(error as GeolocationPositionError);
      lastReason = reason;

      // Don't retry if permission is denied.
      if (reason === "denied") {
        return {
          ok: false,
          reason,
          attempts,
          permissionState,
        };
      }

      // Retry once only for transient failures.
      const shouldRetry = reason === "timeout" || reason === "unavailable";
      if (!shouldRetry || attempts >= Math.max(1, maxAttempts)) {
        break;
      }
    }
  }

  return {
    ok: false,
    reason: lastReason,
    attempts,
    permissionState,
  };
}

export function getGeolocationFailureMessage(
  reason: GeolocationFailureReason,
  options?: { includeManualFallback?: boolean; locale?: Locale },
): string {
  const includeManualFallback = options?.includeManualFallback ?? false;
  const translate = (key: string) =>
    options?.locale
      ? translateMessage(options.locale, key)
      : translateStoredMessage(key);

  const baseMessage =
    reason === "denied"
      ? translate("geo.denied")
      : reason === "unsupported"
        ? translate("geo.unsupported")
        : reason === "insecure"
          ? translate("geo.insecure")
          : translate("geo.generic");

  if (!includeManualFallback) {
    return baseMessage;
  }

  return `${baseMessage} ${translate("geo.manualSuffix")}`;
}
