import { clamp } from "@/shared/geo/math";
import { CUSTOM_LAYOUT_ID } from "./types";
import type { Layout } from "./types";

export function matchesLayoutSize(
  layoutOption: Layout,
  widthCm: number,
  heightCm: number,
  toleranceCm: number,
): boolean {
  return (
    Math.abs(layoutOption.widthCm - widthCm) <= toleranceCm &&
    Math.abs(layoutOption.heightCm - heightCm) <= toleranceCm
  );
}

export function resolveLayoutIdForSize(
  widthCm: number,
  heightCm: number,
  currentLayoutId: string,
  toleranceCm: number,
  currentLayout: Layout | null,
  allLayouts: Layout[],
): string {
  if (
    currentLayout &&
    matchesLayoutSize(currentLayout, widthCm, heightCm, toleranceCm)
  ) {
    return currentLayout.id;
  }

  const matching = allLayouts.find((lo) =>
    matchesLayoutSize(lo, widthCm, heightCm, toleranceCm),
  );

  return matching?.id ?? CUSTOM_LAYOUT_ID;
}

export function normalizePosterSizeValue(
  value: unknown,
  fallbackValue: number,
  minCm: number,
  maxCm: number,
): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return clamp(fallbackValue, minCm, maxCm);
  }
  return clamp(parsed, minCm, maxCm);
}

export function formatLayoutCm(value: number): string {
  const rounded = Math.round(Number(value) * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : String(rounded);
}
