import { slugify } from "@/shared/utils/string";

function createTimestamp(): string {
  const date = new Date();
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}${month}${day}_${hours}${minutes}${seconds}`;
}

function normalizeExtension(value: string | undefined): string {
  const trimmed = String(value ?? "png")
    .trim()
    .toLowerCase();
  return trimmed || "png";
}

export function createPosterFilename(
  cityOrLocation: string,
  themeId: string,
  extension = "png",
): string {
  const citySlug = slugify(cityOrLocation) || "city";
  const normalizedExtension = normalizeExtension(extension);
  return `${citySlug}_${themeId}_${createTimestamp()}.${normalizedExtension}`;
}
