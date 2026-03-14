import { useState } from "react";
import { AppProviders } from "@/core/AppProviders";
import AppHeader from "@/shared/ui/AppHeader";
import FooterNote from "@/shared/ui/FooterNote";
import SettingsPanel from "@/features/poster/ui/SettingsPanel";
import PreviewPanel from "@/features/poster/ui/PreviewPanel";
import InfoPanel from "@/shared/ui/InfoPanel";
import AnnouncementModal from "@/features/updates/ui/AnnouncementModal";
import MobileNavBar, { type MobileTab } from "@/shared/ui/MobileNavBar";

/**
 * Thin inner shell that lives inside the PosterProvider
 * so hooks have access to context.
 */
function AppShell() {
  const [mobileTab, setMobileTab] = useState<MobileTab>("location");

  return (
    <div className="app-shell" data-mobile-tab={mobileTab}>
      <AppHeader />
      <main className="app-grid">
        <SettingsPanel />
        <PreviewPanel />
        <InfoPanel />
      </main>
      <div className="mobile-persistent-footer">
        <InfoPanel />
      </div>
      <MobileNavBar activeTab={mobileTab} onTabChange={setMobileTab} />
      <FooterNote />
      <AnnouncementModal />
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
