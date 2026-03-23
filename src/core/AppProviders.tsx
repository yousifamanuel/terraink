import type { ReactNode } from "react";
import { LocaleProvider } from "@/core/i18n/LocaleContext";
import { PosterProvider } from "@/features/poster/ui/PosterContext";

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * Wraps the application in all required context providers.
 * Add new providers here as needed.
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <LocaleProvider>
      <PosterProvider>{children}</PosterProvider>
    </LocaleProvider>
  );
}
