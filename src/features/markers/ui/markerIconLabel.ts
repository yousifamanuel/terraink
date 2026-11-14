import type { TFunction } from "i18next";
import type { MarkerIconDefinition } from "@/features/markers/domain/types";

/* Built-in icons get a translated name; uploaded icons keep their file name. */
export function getMarkerIconLabel(
  t: TFunction,
  icon: Pick<MarkerIconDefinition, "id" | "label" | "source">,
): string {
  if (icon.source !== "predefined") return icon.label;
  return t(`markers.icons.${icon.id}`, { defaultValue: icon.label });
}
