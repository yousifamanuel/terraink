/** Languages the app ships. English is the fallback for everything else. */
export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "de", label: "Deutsch" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "pt-BR", label: "Português (Brasil)" },
  { code: "it", label: "Italiano" },
  { code: "nl", label: "Nederlands" },
  { code: "pl", label: "Polski" },
  { code: "tr", label: "Türkçe" },
  { code: "ja", label: "日本語" },
  { code: "zh", label: "中文" },
  { code: "ar", label: "العربية" },
] as const;

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]["code"];

export const FALLBACK_LANGUAGE: LanguageCode = "en";

export const SUPPORTED_LANGUAGE_CODES: string[] = SUPPORTED_LANGUAGES.map(
  (l) => l.code,
);
