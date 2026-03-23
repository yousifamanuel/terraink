import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { LocaleProvider, useLocale } from "@/core/i18n/LocaleContext";
import { PosterProvider } from "@/features/poster/ui/PosterContext";
import SettingsPanel from "@/features/poster/ui/SettingsPanel";

vi.mock("@/features/map/application/useGeolocation", () => ({
  useGeolocation: vi.fn(),
}));

vi.mock("@/features/markers/infrastructure/customIconStorage", () => ({
  loadCustomMarkerIcons: vi.fn().mockResolvedValue([]),
  saveCustomMarkerIcons: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/core/services", async () => {
  const actual = await vi.importActual<object>("@/core/services");
  return {
    ...actual,
    reverseGeocodeCoordinates: vi.fn().mockResolvedValue({
      label: "Hanover, Germany",
      city: "Hanover",
      country: "Germany",
      continent: "Europe",
      lat: 52.3759,
      lon: 9.732,
    }),
  };
});

const originalLocalStorage = window.localStorage;

function LocaleControls() {
  const { setLocale } = useLocale();

  return (
    <div>
      <button type="button" onClick={() => setLocale("en")}>
        Switch to English
      </button>
      <button type="button" onClick={() => setLocale("zh-CN")}>
        Switch to Chinese
      </button>
    </div>
  );
}

function SettingsPanelFixture() {
  const [mounted, setMounted] = useState(true);

  return (
    <>
      <LocaleControls />
      <button type="button" onClick={() => setMounted((value) => !value)}>
        Toggle settings panel
      </button>
      {mounted ? <SettingsPanel /> : null}
    </>
  );
}

function renderSettingsPanel() {
  return render(
    <LocaleProvider>
      <PosterProvider>
        <SettingsPanelFixture />
      </PosterProvider>
    </LocaleProvider>,
  );
}

describe("SettingsPanel localization", () => {
  beforeEach(() => {
    const store = new Map<string, string>();
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: {
        getItem: (key: string) => store.get(key) ?? null,
        setItem: (key: string, value: string) => {
          store.set(key, value);
        },
        removeItem: (key: string) => {
          store.delete(key);
        },
        clear: () => {
          store.clear();
        },
      },
    });

    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    cleanup();
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: originalLocalStorage,
    });
  });

  it("updates settings labels when the locale changes", async () => {
    const user = userEvent.setup();

    renderSettingsPanel();

    expect(screen.getByRole("button", { name: "Location" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Style" })).toBeInTheDocument();
    expect(screen.getByLabelText("Display city")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Switch to Chinese" }));

    expect(screen.getByRole("button", { name: "位置" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "样式" })).toBeInTheDocument();
    expect(screen.getByLabelText("显示城市")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "国际主要城市" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("午夜蓝").length).toBeGreaterThan(0);
    expect(screen.getAllByText("A4 纵向").length).toBeGreaterThan(0);
    expect(screen.getAllByText("打印").length).toBeGreaterThan(0);
  });

  it("expands quick cities and selects a curated city from the location panel", async () => {
    const user = userEvent.setup();

    renderSettingsPanel();

    const locationInput = screen.getByLabelText("Location");
    const trigger = screen.getByRole("button", { name: "Global Cities" });

    expect(screen.queryByRole("button", { name: "Tokyo" })).not.toBeInTheDocument();

    await user.click(trigger);

    expect(screen.getAllByText("Global Cities").length).toBeGreaterThan(0);
    expect(screen.getByText("China")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tokyo" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Hangzhou" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Tokyo" }));

    expect(locationInput).toHaveValue("Tokyo, Japan");
    expect(screen.queryByRole("button", { name: "Tokyo" })).not.toBeInTheDocument();
  });

  it("keeps poster text field values unchanged across locale toggles", async () => {
    const user = userEvent.setup();

    renderSettingsPanel();

    const cityInput = screen.getByLabelText("Display city");
    const countryInput = screen.getByLabelText("Display country");

    await user.clear(cityInput);
    await user.type(cityInput, "Custom City");
    await user.clear(countryInput);
    await user.type(countryInput, "Custom Country");

    await user.click(screen.getByRole("button", { name: "Switch to Chinese" }));

    expect(screen.getByLabelText("显示城市")).toHaveValue("Custom City");
    expect(screen.getByLabelText("显示国家")).toHaveValue("Custom Country");

    await user.click(screen.getByRole("button", { name: "Switch to English" }));

    expect(screen.getByLabelText("Display city")).toHaveValue("Custom City");
    expect(screen.getByLabelText("Display country")).toHaveValue("Custom Country");
  });

  it("preserves restored poster text values after remount and locale toggles", async () => {
    const user = userEvent.setup();

    renderSettingsPanel();

    const cityInput = screen.getByLabelText("Display city");
    const countryInput = screen.getByLabelText("Display country");

    await user.clear(cityInput);
    await user.type(cityInput, "Restored City");
    await user.clear(countryInput);
    await user.type(countryInput, "Restored Country");

    await user.click(screen.getByRole("button", { name: "Toggle settings panel" }));
    await user.click(screen.getByRole("button", { name: "Toggle settings panel" }));

    expect(screen.getByLabelText("Display city")).toHaveValue("Restored City");
    expect(screen.getByLabelText("Display country")).toHaveValue("Restored Country");

    await user.click(screen.getByRole("button", { name: "Switch to Chinese" }));

    expect(screen.getByLabelText("显示城市")).toHaveValue("Restored City");
    expect(screen.getByLabelText("显示国家")).toHaveValue("Restored Country");
  });
});
