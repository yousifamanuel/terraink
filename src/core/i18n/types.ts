export type Locale = "en" | "zh-CN";

export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_STORAGE_KEY = "terraink.locale";

export function isLocale(value: string): value is Locale {
  return value === "en" || value === "zh-CN";
}

export type MessageCatalog = Record<string, string>;
