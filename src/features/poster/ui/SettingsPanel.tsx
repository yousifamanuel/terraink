import { useState } from "react";
import { useTranslation } from "react-i18next";
import { usePosterContext } from "@/features/poster/ui/PosterContext";
import { useFormHandlers } from "@/features/poster/application/useFormHandlers";
import { useLocationAutocomplete } from "@/features/location/application/useLocationAutocomplete";
import { useCurrentLocation } from "@/features/location/application/useCurrentLocation";
import { useMapSync } from "@/features/map/application/useMapSync";
import type { MobileTab } from "@/shared/ui/MobileNavBar";

import LocationSection from "@/features/location/ui/LocationSection";
import MapSettingsSection from "@/features/map/ui/MapSettingsSection";
import SettingsSection from "@/features/settings/ui/SettingsSection";
import LayersSection from "@/features/map/ui/LayersSection";
import MarkersSection from "@/features/markers/ui/MarkersSection";
import RoutesSection from "@/features/routes/ui/RoutesSection";
import TypographySection from "@/features/poster/ui/TypographySection";
import {
  LocationIcon,
  ThemeIcon,
  LayoutIcon,
  LayersIcon,
  MarkersIcon,
  RouteIcon,
  StyleIcon,
  ChevronDownIcon,
} from "@/shared/ui/Icons";

import { themeOptions } from "@/features/theme/infrastructure/themeRepository";
import { layoutGroups } from "@/features/layout/infrastructure/layoutRepository";
import {
  MIN_POSTER_CM,
  MAX_POSTER_CM,
  FONT_OPTIONS,
} from "@/core/config";
import type { SearchResult } from "@/features/location/domain/types";

type SectionId =
  | "location"
  | "theme"
  | "layout"
  | "layers"
  | "markers"
  | "routes"
  | "style";

const accordionSections: {
  id: SectionId;
  labelKey: string;
  Icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "location", labelKey: "poster.sections.location", Icon: LocationIcon },
  { id: "theme", labelKey: "poster.sections.theme", Icon: ThemeIcon },
  { id: "layout", labelKey: "poster.sections.layout", Icon: LayoutIcon },
  { id: "layers", labelKey: "poster.sections.layers", Icon: LayersIcon },
  { id: "markers", labelKey: "poster.sections.markers", Icon: MarkersIcon },
  { id: "routes", labelKey: "poster.sections.routes", Icon: RouteIcon },
  { id: "style", labelKey: "poster.sections.style", Icon: StyleIcon },
];

export default function SettingsPanel({
  mobileTab,
  activeTab,
}: {
  mobileTab?: MobileTab;
  activeTab?: MobileTab;
}) {
  const { t } = useTranslation();
  const { state, dispatch, mapRef, selectedTheme, effectiveTheme } =
    usePosterContext();
  const {
    handleChange,
    handleNumericFieldBlur,
    handleThemeChange,
    handleLayoutChange,
    handleColorChange,
    handleResetColors,
    handleSetCustomColors,
    handleAddSavedTheme,
    handleUpdateSavedTheme,
    handleRemoveSavedTheme,
    handleLocationSelect,
    handleClearLocation,
    setLocationFocused,
    handleCreditsChange,
  } = useFormHandlers();
  const { locationSuggestions, isLocationSearching, searchNow } = useLocationAutocomplete(
    state.form.location,
    state.isLocationFocused,
  );
  const { flyToLocation } = useMapSync(state, dispatch, mapRef);
  const {
    handleUseCurrentLocation,
    isLocatingUser,
    locationPermissionMessage,
    dismissLocationPermissionMessage,
  } =
    useCurrentLocation(flyToLocation);

  const [isColorEditorActive, setIsColorEditorActive] = useState(false);
  const [openSections, setOpenSections] = useState<Set<SectionId>>(
    new Set(["location", "theme", "layout", "style"]),
  );

  const isAuxEditorActive = isColorEditorActive;

  const toggleSection = (id: SectionId) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const onLocationSelect = (location: SearchResult) => {
    handleLocationSelect(location);
    flyToLocation(location.lat, location.lon);
  };

  if (activeTab === "settings") {
    return (
      <form className="settings-panel" onSubmit={(e) => e.preventDefault()}>
        <SettingsSection />
      </form>
    );
  }

  return (
    <form className="settings-panel" onSubmit={(e) => e.preventDefault()}>
      <div
        className={`mobile-section mobile-section--location accordion-item${openSections.has("location") ? " accordion-item--open" : ""}`}
      >
        <AccordionHeader
          sectionId="location"
          label={t(accordionSections[0].labelKey)}
          Icon={accordionSections[0].Icon}
          isOpen={openSections.has("location")}
          onToggle={toggleSection}
        />
        <div
          className={`accordion-body${openSections.has("location") ? " is-open" : ""}`}
        >
          <div className="accordion-body-inner">
            {!isColorEditorActive ? (
              <LocationSection
                form={state.form}
                onChange={handleChange}
                onLocationFocus={() => setLocationFocused(true)}
                onLocationBlur={() => setLocationFocused(false)}
                searchNow={searchNow}
                isLocationFocused={state.isLocationFocused}
                locationSuggestions={locationSuggestions}
                isLocationSearching={isLocationSearching}
                onLocationSelect={onLocationSelect}
                onClearLocation={handleClearLocation}
                onUseCurrentLocation={handleUseCurrentLocation}
                isLocatingUser={isLocatingUser}
                locationPermissionMessage={locationPermissionMessage}
                onDismissLocationPermissionMessage={
                  dismissLocationPermissionMessage
                }
              />
            ) : null}
          </div>
        </div>
      </div>

      <div
        className={`mobile-section mobile-section--theme-settings accordion-item${openSections.has("theme") ? " accordion-item--open" : ""}`}
      >
        <AccordionHeader
          sectionId="theme"
          label={t(accordionSections[1].labelKey)}
          Icon={accordionSections[1].Icon}
          isOpen={openSections.has("theme")}
          onToggle={toggleSection}
        />
        <div
          className={`accordion-body${openSections.has("theme") ? " is-open" : ""}`}
        >
          <div className="accordion-body-inner">
            {!isColorEditorActive ? (
              <MapSettingsSection
                activeMobileTab={mobileTab}
                form={state.form}
                onChange={handleChange}
                onNumericFieldBlur={handleNumericFieldBlur}
                onThemeChange={handleThemeChange}
                onLayoutChange={handleLayoutChange}
                selectedTheme={selectedTheme}
                themeOptions={themeOptions}
                layoutGroups={layoutGroups}
                minPosterCm={MIN_POSTER_CM}
                maxPosterCm={MAX_POSTER_CM}
                customColors={state.customColors}
                onColorChange={handleColorChange}
                onResetColors={handleResetColors}
                onColorEditorActiveChange={setIsColorEditorActive}
                effectiveTheme={effectiveTheme}
                savedThemes={state.savedThemes}
                onAddSavedTheme={handleAddSavedTheme}
                onUpdateSavedTheme={handleUpdateSavedTheme}
                onRemoveSavedTheme={handleRemoveSavedTheme}
                onSetCustomColors={handleSetCustomColors}
              />
            ) : null}
          </div>
        </div>
      </div>

      <div
        className={`mobile-section mobile-section--layout-settings accordion-item${openSections.has("layout") ? " accordion-item--open" : ""}`}
      >
        <AccordionHeader
          sectionId="layout"
          label={t(accordionSections[2].labelKey)}
          Icon={accordionSections[2].Icon}
          isOpen={openSections.has("layout")}
          onToggle={toggleSection}
        />
        <div
          className={`accordion-body${openSections.has("layout") ? " is-open" : ""}`}
        >
          <div className="accordion-body-inner">
            {!isColorEditorActive ? (
              <MapSettingsSection
                activeMobileTab={mobileTab}
                form={state.form}
                onChange={handleChange}
                onNumericFieldBlur={handleNumericFieldBlur}
                onThemeChange={handleThemeChange}
                onLayoutChange={handleLayoutChange}
                selectedTheme={selectedTheme}
                themeOptions={themeOptions}
                layoutGroups={layoutGroups}
                minPosterCm={MIN_POSTER_CM}
                maxPosterCm={MAX_POSTER_CM}
                customColors={state.customColors}
                onColorChange={handleColorChange}
                onResetColors={handleResetColors}
                onColorEditorActiveChange={setIsColorEditorActive}
                effectiveTheme={effectiveTheme}
                savedThemes={state.savedThemes}
                onAddSavedTheme={handleAddSavedTheme}
                onUpdateSavedTheme={handleUpdateSavedTheme}
                onRemoveSavedTheme={handleRemoveSavedTheme}
                onSetCustomColors={handleSetCustomColors}
              />
            ) : null}
          </div>
        </div>
      </div>

      <div
        className={`mobile-section mobile-section--layers accordion-item${openSections.has("layers") ? " accordion-item--open" : ""}`}
      >
        <AccordionHeader
          sectionId="layers"
          label={t(accordionSections[3].labelKey)}
          Icon={accordionSections[3].Icon}
          isOpen={openSections.has("layers")}
          onToggle={toggleSection}
        />
        <div
          className={`accordion-body${openSections.has("layers") ? " is-open" : ""}`}
        >
          <div className="accordion-body-inner">
            {!isAuxEditorActive ? (
              <LayersSection
                form={state.form}
                onChange={handleChange}
                minPosterCm={MIN_POSTER_CM}
                maxPosterCm={MAX_POSTER_CM}
                onNumericFieldBlur={handleNumericFieldBlur}
              />
            ) : null}
          </div>
        </div>
      </div>

      <div
        className={`mobile-section mobile-section--markers accordion-item${openSections.has("markers") ? " accordion-item--open" : ""}`}
      >
        <AccordionHeader
          sectionId="markers"
          label={t(accordionSections[4].labelKey)}
          Icon={accordionSections[4].Icon}
          isOpen={openSections.has("markers")}
          onToggle={toggleSection}
        />
        <div
          className={`accordion-body${openSections.has("markers") ? " is-open" : ""}`}
        >
          <div className="accordion-body-inner">
            {!isColorEditorActive ? <MarkersSection /> : null}
          </div>
        </div>
      </div>

      <div
        className={`mobile-section mobile-section--routes accordion-item${openSections.has("routes") ? " accordion-item--open" : ""}`}
      >
        <AccordionHeader
          sectionId="routes"
          label={t(accordionSections[5].labelKey)}
          Icon={accordionSections[5].Icon}
          isOpen={openSections.has("routes")}
          onToggle={toggleSection}
        />
        <div
          className={`accordion-body${openSections.has("routes") ? " is-open" : ""}`}
        >
          <div className="accordion-body-inner">
            {!isColorEditorActive ? <RoutesSection /> : null}
          </div>
        </div>
      </div>

      <div
        className={`mobile-section mobile-section--style accordion-item${openSections.has("style") ? " accordion-item--open" : ""}`}
      >
        <AccordionHeader
          sectionId="style"
          label={t(accordionSections[6].labelKey)}
          Icon={accordionSections[6].Icon}
          isOpen={openSections.has("style")}
          onToggle={toggleSection}
        />
        <div
          className={`accordion-body${openSections.has("style") ? " is-open" : ""}`}
        >
          <div className="accordion-body-inner">
            {!isAuxEditorActive ? (
              <TypographySection
                form={state.form}
                onChange={handleChange}
                fontOptions={FONT_OPTIONS}
              />
            ) : null}
          </div>
        </div>
      </div>

      {!isAuxEditorActive && state.error ? <p className="error">{state.error}</p> : null}
    </form>
  );
}

function AccordionHeader({
  sectionId,
  label,
  Icon,
  isOpen,
  onToggle,
}: {
  sectionId: SectionId;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  isOpen: boolean;
  onToggle: (id: SectionId) => void;
}) {
  return (
    <button
      type="button"
      className={`accordion-header${isOpen ? " is-open" : ""}`}
      onClick={() => onToggle(sectionId)}
      aria-expanded={isOpen}
    >
      <Icon className="accordion-icon" />
      <span className="accordion-label">{label}</span>
      <ChevronDownIcon className="accordion-chevron" />
    </button>
  );
}
