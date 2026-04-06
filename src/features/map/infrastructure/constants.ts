export const GEOLOCATION_TIMEOUT_MS = 8_000;

export const MAP_BUTTON_ZOOM_STEP = 0.5;
export const MAP_BUTTON_ZOOM_DURATION_MS = 280;

export const MAP_CENTER_SYNC_EPSILON = 0.0000005;
export const MAP_ZOOM_SYNC_EPSILON = 0.0008;
export const MAP_BEARING_SYNC_EPSILON = 0.1;

export const DISTANCE_SLIDER_STEP_METERS = 100;

/**
 * Over-zoom settings for poster workflow:
 * render map at higher internal zoom and compensate viewport scale to preserve framing.
 */
export const MAP_OVERZOOM_SCALE = 5.5;

/**
 * Target effective container width (px) for consistent tile detail across
 * screen sizes.  On small viewports the overzoom scale is increased so the
 * MapLibre zoom (and therefore tile detail level) stays the same as on
 * desktop.
 */
export const MIN_EFFECTIVE_CONTAINER_PX = 3300; // DEFAULT_CONTAINER_PX * MAP_OVERZOOM_SCALE

/** Safety cap so tiny viewports don't produce unreasonably large canvases. */
export const MAX_OVERZOOM_SCALE = 10;
