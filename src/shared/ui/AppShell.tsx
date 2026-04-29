import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { usePosterContext } from "@/features/poster/ui/PosterContext";
import {
  MAX_MARKER_SIZE,
  MIN_MARKER_SIZE,
} from "@/features/markers/domain/constants";
import GeneralHeader from "@/shared/ui/GeneralHeader";
import DesktopNavBar from "@/shared/ui/DesktopNavBar";
import FooterNote from "@/shared/ui/FooterNote";
import PreviewPanel from "@/features/poster/ui/PreviewPanel";
import MobileNavBar, { type MobileTab } from "@/shared/ui/MobileNavBar";
import InstallPrompt from "@/features/install/ui/InstallPrompt";
import { useSwipeDown } from "@/shared/hooks/useSwipeDown";
import StartupLocationModal from "@/features/location/ui/StartupLocationModal";
import { CheckIcon } from "@/shared/ui/Icons";
import SupportModal from "@/features/export/ui/SupportModal";
import AdBlockModal from "@/features/export/ui/AdBlockModal";
import {
  SUPPORT_PROMPT_EVENT,
  ADBLOCK_LIMIT_EVENT,
  ADBLOCK_WARN_EVENT,
  type SupportPromptState,
} from "@/features/export/application/useExport";

const AboutModal = lazy(() => import("@/shared/ui/AboutModal"));
const SettingsPanel = lazy(() => import("@/features/poster/ui/SettingsPanel"));
const AnnouncementModal = lazy(
  () => import("@/features/updates/ui/AnnouncementModal"),
);
const ExportFab = lazy(() => import("@/features/export/ui/ExportFab"));
const DesktopLocationBar = lazy(() => import("@/shared/ui/DesktopLocationBar"));

function SettingsDrawer({
  mobileTab,
  onClose,
}: {
  mobileTab: MobileTab;
  onClose: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { sheetRef, handleRef, handleProps } = useSwipeDown(onClose, 80, {
    onExpand: () => setIsExpanded(true),
  });

  return (
    <div className="mobile-drawer" role="dialog" aria-label="Settings">
      <div
        className="mobile-drawer-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`mobile-drawer-sheet${isExpanded ? " is-expanded" : ""}`}
        ref={sheetRef}
        data-mobile-tab={mobileTab}
      >
        <div
          className="mobile-drawer-handle"
          ref={handleRef}
          aria-hidden="true"
          {...handleProps}
        />
        <div className="mobile-drawer-content">
          <SettingsPanel mobileTab={mobileTab} />
        </div>
      </div>
    </div>
  );
}

export default function AppShell() {
  const { state, dispatch } = usePosterContext();
  const { isMarkerEditorActive } = state;
  const activeMarker =
    state.activeMarkerId !== null
      ? state.markers.find((marker) => marker.id === state.activeMarkerId) ?? null
      : null;

  // Mobile state
  const [mobileTab, setMobileTab] = useState<MobileTab>("theme");
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [mobileLocationRowVisible, setMobileLocationRowVisible] =
    useState(true);
  const [isMobileViewport, setIsMobileViewport] = useState(false);

  // Desktop state
  const [desktopTab, setDesktopTab] = useState<MobileTab>("theme");
  const [desktopPanelOpen, setDesktopPanelOpen] = useState(false);
  const [desktopLocationRowVisible, setDesktopLocationRowVisible] =
    useState(true);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [supportPrompt, setSupportPrompt] = useState<SupportPromptState | null>(null);
  const [adBlockModal, setAdBlockModal] = useState<{
    variant: "warning" | "limit";
    hoursUntilReset?: number;
  } | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      setSupportPrompt((e as CustomEvent<SupportPromptState>).detail);
    };
    window.addEventListener(SUPPORT_PROMPT_EVENT, handler);
    return () => window.removeEventListener(SUPPORT_PROMPT_EVENT, handler);
  }, []);

  useEffect(() => {
    const handler = () => setAdBlockModal({ variant: "warning" });
    window.addEventListener(ADBLOCK_WARN_EVENT, handler);
    return () => window.removeEventListener(ADBLOCK_WARN_EVENT, handler);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const { hoursUntilReset } = (e as CustomEvent).detail;
      setAdBlockModal({ variant: "limit", hoursUntilReset });
    };
    window.addEventListener(ADBLOCK_LIMIT_EVENT, handler);
    return () => window.removeEventListener(ADBLOCK_LIMIT_EVENT, handler);
  }, []);

  useEffect(() => {
    const preload = () => {
      void import("@/features/poster/ui/SettingsPanel");
      void import("@/shared/ui/DesktopLocationBar");
      void import("@/features/export/ui/ExportFab");
      void import("@/features/updates/ui/AnnouncementModal");
    };

    if ("requestIdleCallback" in window) {
      const idleId = window.requestIdleCallback(preload, { timeout: 2000 });
      return () => window.cancelIdleCallback(idleId);
    }

    const timer = setTimeout(preload, 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia(
      "(max-width: 768px), (hover: none) and (pointer: coarse)",
    );
    const syncViewport = () => setIsMobileViewport(mediaQuery.matches);
    syncViewport();
    mediaQuery.addEventListener("change", syncViewport);

    return () => mediaQuery.removeEventListener("change", syncViewport);
  }, []);

  useEffect(() => {
    if (!mobileDrawerOpen) {
      return;
    }

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverscroll = document.body.style.overscrollBehavior;
    const previousHtmlOverscroll = document.documentElement.style.overscrollBehavior;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";
    document.documentElement.style.overscrollBehavior = "none";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overscrollBehavior = previousBodyOverscroll;
      document.documentElement.style.overscrollBehavior = previousHtmlOverscroll;
    };
  }, [mobileDrawerOpen]);

  const handleMobileTabChange = (tab: MobileTab) => {
    if (tab === "location") {
      setMobileLocationRowVisible((isVisible) => !isVisible);
      setMobileDrawerOpen(false);
      return;
    }

    if (tab === mobileTab && mobileDrawerOpen) {
      setMobileDrawerOpen(false);
    } else {
      setMobileTab(tab);
      setMobileDrawerOpen(true);
    }
  };

  const handleDesktopTabChange = (tab: MobileTab) => {
    if (tab === desktopTab && desktopPanelOpen) {
      setDesktopPanelOpen(false);
    } else {
      setDesktopTab(tab);
      setDesktopPanelOpen(true);
    }
  };

  const handleMobileMarkerSizeChange = useCallback(
    (nextSize: number) => {
      if (!activeMarker) {
        return;
      }
      const clampedSize = Math.max(
        MIN_MARKER_SIZE,
        Math.min(MAX_MARKER_SIZE, Math.round(nextSize)),
      );
      dispatch({
        type: "UPDATE_MARKER",
        markerId: activeMarker.id,
        changes: { size: clampedSize },
      });
    },
    [activeMarker, dispatch],
  );

  return (
    <div
      className="app-shell"
      data-mobile-tab={mobileTab}
      data-desktop-tab={desktopTab}
    >
      <GeneralHeader onAboutOpen={() => setAboutOpen(true)} />
      <InstallPrompt />
      <StartupLocationModal />

      <DesktopNavBar
        activeTab={desktopTab}
        panelOpen={desktopPanelOpen}
        onTabChange={handleDesktopTabChange}
        isLocationVisible={desktopLocationRowVisible}
        onLocationToggle={() =>
          setDesktopLocationRowVisible((isVisible) => !isVisible)
        }
      />

      <div
        className={`desktop-location-row-wrap${desktopLocationRowVisible ? "" : " is-hidden"}`}
      >
        <Suspense fallback={null}>
          <DesktopLocationBar />
        </Suspense>
      </div>

      <div
        className={`mobile-location-row-wrap${mobileLocationRowVisible ? "" : " is-hidden"}`}
      >
        <Suspense fallback={null}>
          <DesktopLocationBar />
        </Suspense>
      </div>
      {isMobileViewport && isMarkerEditorActive && activeMarker ? (
        <div
          className="mobile-marker-size-bar"
          role="group"
          aria-label="Selected marker size"
        >
          <p className="mobile-marker-size-bar__label">Marker Size</p>
          <div className="mobile-marker-size-bar__controls">
            <input
              type="range"
              className="mobile-marker-size-bar__slider map-control-slider"
              min={MIN_MARKER_SIZE}
              max={MAX_MARKER_SIZE}
              step={1}
              value={Math.round(activeMarker.size)}
              onChange={(event) =>
                handleMobileMarkerSizeChange(Number(event.target.value))
              }
            />
            <span className="mobile-marker-size-bar__value">
              {Math.round(activeMarker.size)}px
            </span>
          </div>
        </div>
      ) : null}

      <div className="desktop-left-panel">
        <div
          className={`desktop-settings-slide${desktopPanelOpen ? " is-open" : ""}`}
        >
          <Suspense fallback={null}>
            <SettingsPanel />
          </Suspense>
        </div>
      </div>

      <PreviewPanel />

      {mobileDrawerOpen ? (
        <SettingsDrawer
          mobileTab={mobileTab}
          onClose={() => setMobileDrawerOpen(false)}
        />
      ) : null}

      {isMobileViewport && isMarkerEditorActive ? (
        <button
          type="button"
          className="mobile-marker-edit-done"
          onClick={() => {
            dispatch({ type: "SET_MARKER_EDITOR_ACTIVE", active: false });
            dispatch({ type: "SET_ACTIVE_MARKER", markerId: null });
            setMobileDrawerOpen(false);
          }}
        >
          <CheckIcon />
          <span>Done Editing</span>
        </button>
      ) : null}

      <MobileNavBar
        activeTab={mobileTab}
        drawerOpen={mobileDrawerOpen}
        isLocationVisible={mobileLocationRowVisible}
        onTabChange={handleMobileTabChange}
      />
      <Suspense fallback={null}>
        <ExportFab isMobile={isMobileViewport} />
      </Suspense>

      <FooterNote />
      <Suspense fallback={null}>
        <AnnouncementModal />
      </Suspense>
      {aboutOpen ? (
        <Suspense fallback={null}>
          <AboutModal onClose={() => setAboutOpen(false)} />
        </Suspense>
      ) : null}
      {supportPrompt ? (
        <SupportModal
          posterNumber={supportPrompt.posterNumber}
          variant={supportPrompt.variant}
          onClose={() => setSupportPrompt(null)}
        />
      ) : null}
      {adBlockModal ? (
        <AdBlockModal
          variant={adBlockModal.variant}
          hoursUntilReset={adBlockModal.hoursUntilReset}
          onClose={() => setAdBlockModal(null)}
        />
      ) : null}
    </div>
  );
}
