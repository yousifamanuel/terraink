import { createContext, useContext, useState, type ReactNode } from "react";
import { readLocale, writeLocale } from "./storage";
import { translateMessage } from "./translate";
import type { Locale } from "./types";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (nextLocale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => readLocale());

  const value: LocaleContextValue = {
    locale,
    setLocale: (nextLocale: Locale) => {
      setLocaleState(nextLocale);
      writeLocale(nextLocale);
    },
    t: (key: string, params?: Record<string, string | number>) =>
      translateMessage(locale, key, params),
  };

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  const value = useContext(LocaleContext);

  if (!value) {
    throw new Error("useLocale must be used within LocaleProvider");
  }

  return value;
}

export { DEFAULT_LOCALE, type Locale } from "./types";
