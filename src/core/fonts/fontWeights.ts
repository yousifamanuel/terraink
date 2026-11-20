/**
 * Display faces that ship one regular weight and are drawn from thin lines
 * or outlines. A faked bold fills those lines in, so poster titles keep
 * them at their regular weight.
 */
const REGULAR_ONLY_FAMILIES = new Set([
  "bungee",
  "bungee inline",
  "faster one",
  "lobster",
  "monoton",
  "pacifico",
  "righteous",
  "yellowtail",
]);

/** Weight for the poster title in the given family ("" = default face). */
export function posterTitleWeight(fontFamily: string | undefined): number {
  const family = String(fontFamily ?? "").trim().toLowerCase();
  return REGULAR_ONLY_FAMILIES.has(family) ? 400 : 700;
}
