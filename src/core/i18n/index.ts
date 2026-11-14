import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import { FALLBACK_LANGUAGE, SUPPORTED_LANGUAGE_CODES } from "./languages";

const LANGUAGE_STORAGE_KEY = "terraink:language";

/* English is bundled; every other language is its own small chunk,
   loaded only when that language is picked. */
const lazyLocales = import.meta.glob<{ default: Record<string, unknown> }>(
  ["./locales/*.json", "!./locales/en.json"],
);

async function loadLanguage(code: string): Promise<void> {
  if (i18n.hasResourceBundle(code, "translation")) return;
  const loader = lazyLocales[`./locales/${code}.json`];
  if (!loader) return;
  const mod = await loader();
  i18n.addResourceBundle(code, "translation", mod.default, true, true);
}

/* Arabic is kept left-to-right on purpose, so only `lang` changes. */
function syncHtmlLang(code: string) {
  if (typeof document !== "undefined") {
    document.documentElement.lang = code;
  }
}

i18n.on("languageChanged", (code) => {
  syncHtmlLang(code);
  // Components re-render when the bundle is added (bindI18nStore: "added").
  void loadLanguage(code);
});

/** Resolves once the starting language is loaded, so the first paint is translated. */
export const i18nReady: Promise<void> = i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { en: { translation: en } },
    fallbackLng: FALLBACK_LANGUAGE,
    supportedLngs: SUPPORTED_LANGUAGE_CODES,
    // The detector maps regional codes to a supported one:
    // "de-AT" → "de", "pt-PT" → "pt-BR", unknown → English.
    load: "currentOnly",
    partialBundledLanguages: true,
    interpolation: { escapeValue: false },
    react: { bindI18nStore: "added" },
    detection: {
      // A manual pick (saved under this key) wins over the browser language.
      // Only manual picks are saved, so browser changes still apply otherwise.
      order: ["localStorage", "navigator"],
      lookupLocalStorage: LANGUAGE_STORAGE_KEY,
      caches: [],
    },
  })
  .then(() => loadLanguage(i18n.language))
  .catch(() => undefined);

/** Manual pick from the language picker; remembered on this device. */
export function changeLanguage(code: string): Promise<unknown> {
  i18n.services.languageDetector?.cacheUserLanguage?.(code, ["localStorage"]);
  return loadLanguage(code).then(() => i18n.changeLanguage(code));
}

export default i18n;
