import { AppProviders } from "@/core/AppProviders";
import AppHeader from "@/shared/ui/AppHeader";
import FooterNote from "@/shared/ui/FooterNote";
import SettingsPanel from "@/features/poster/ui/SettingsPanel";
import PreviewPanel from "@/features/poster/ui/PreviewPanel";
import InfoPanel from "@/shared/ui/InfoPanel";

/**
 * Thin inner shell that lives inside the PosterProvider
 * so hooks have access to context.
 */
function AppShell() {
  return (
    <div className="app-shell">
      <AppHeader />
      <main className="app-grid">
        <SettingsPanel />
        <PreviewPanel />
        <InfoPanel />
      </main>
      <FooterNote />
    </div>
  );
}

export default function App() {
  return (
    <AppProviders>
      <AppShell />
    </AppProviders>
  );
}
