import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LocaleProvider } from "@/core/i18n/LocaleContext";
import { PosterProvider } from "@/features/poster/ui/PosterContext";
import DesktopLocationBar from "@/shared/ui/DesktopLocationBar";

vi.mock("@/features/map/application/useGeolocation", () => ({
  useGeolocation: vi.fn(),
}));

vi.mock("@/features/markers/infrastructure/customIconStorage", () => ({
  loadCustomMarkerIcons: vi.fn().mockResolvedValue([]),
  saveCustomMarkerIcons: vi.fn().mockResolvedValue(undefined),
}));

const originalLocalStorage = window.localStorage;

function renderLocationBar() {
  return render(
    <LocaleProvider>
      <PosterProvider>
        <DesktopLocationBar />
      </PosterProvider>
    </LocaleProvider>,
  );
}

describe("DesktopLocationBar", () => {
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
  });

  afterEach(() => {
    cleanup();
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: originalLocalStorage,
    });
  });

  it("renders and applies quick cities from the top location bar", async () => {
    const user = userEvent.setup();

    renderLocationBar();

    const locationInput = document.querySelector<HTMLInputElement>(
      'input[name="location"]',
    );
    const trigger = screen.getByRole("button", { name: "Global Cities" });

    expect(locationInput).not.toBeNull();

    expect(screen.queryByRole("button", { name: "Tokyo" })).not.toBeInTheDocument();

    await user.click(trigger);

    expect(screen.getAllByText("Global Cities").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "Tokyo" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Tokyo" }));

    expect(locationInput).toHaveValue("Tokyo, Japan");
    expect(screen.queryByRole("button", { name: "Tokyo" })).not.toBeInTheDocument();
  });
});
