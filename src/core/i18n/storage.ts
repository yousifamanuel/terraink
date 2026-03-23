import { DEFAULT_LOCALE, isLocale, LOCALE_STORAGE_KEY, type Locale } from "./types";

export { LOCALE_STORAGE_KEY } from "./types";

export function readLocale(): Locale {
  if (typeof window === "undefined" || !window.localStorage) {
    return DEFAULT_LOCALE;
  }

  try {
    const storedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    return storedLocale && isLocale(storedLocale) ? storedLocale : DEFAULT_LOCALE;
  } catch {
    return DEFAULT_LOCALE;
  }
}

export function writeLocale(locale: Locale): void {
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }

  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // Ignore localStorage errors so locale selection stays functional.
  }
}
