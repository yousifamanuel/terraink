export const GEOCODE_TTL_MS = 30 * 24 * 60 * 60 * 1000;
export const LOCATION_SEARCH_TTL_MS = 24 * 60 * 60 * 1000;

/**
 * Forces Nominatim to return each place's own local name instead of a
 * translation. Browsers always attach their own `Accept-Language` header
 * to fetch requests, so without this override Nominatim happily serves a
 * name translated into the visitor's browser/device language when one
 * exists for that place, which can pick an unrelated script entirely
 * (e.g. a Serbian-Cyrillic alt name for a Croatian town, for a visitor
 * whose device language is set to Serbian). "xx" is not an assigned
 * ISO 639 language code, so it never matches a translated name tag and
 * Nominatim falls back to the place's genuine local name/script.
 */
export const NOMINATIM_LOCAL_NAME_QUERY = "accept-language=xx";
