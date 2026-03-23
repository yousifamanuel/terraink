import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { LocaleProvider } from "@/core/i18n/LocaleContext";
import SettingsInfo from "@/features/poster/ui/SettingsInfo";

const originalLocalStorage = window.localStorage;

function renderSettingsInfo() {
  return render(
    <LocaleProvider>
      <SettingsInfo
        location="Hanover, Germany"
        theme="Midnight Blue"
        layout="A4 Portrait"
        posterSize="21 x 29.7 cm"
        markerCount={0}
        coordinates="52.3759, 9.7320"
      />
    </LocaleProvider>,
  );
}

describe("SettingsInfo localization", () => {
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

  it("renders the settings summary in English by default", () => {
    renderSettingsInfo();

    expect(
      screen.getByRole("heading", { name: "Current Settings" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Location")).toBeInTheDocument();
    expect(screen.getByText("Poster Size")).toBeInTheDocument();
    expect(screen.getByText("0 markers")).toBeInTheDocument();
  });

  it("renders the settings summary labels in Chinese when zh-CN is stored", () => {
    window.localStorage.setItem("terraink.locale", "zh-CN");

    renderSettingsInfo();

    expect(
      screen.getByRole("heading", { name: "当前设置" }),
    ).toBeInTheDocument();
    expect(screen.getByText("位置")).toBeInTheDocument();
    expect(screen.getByText("海报尺寸")).toBeInTheDocument();
    expect(screen.getByText("0 个标记")).toBeInTheDocument();
    expect(screen.getByText("Midnight Blue")).toBeInTheDocument();
    expect(screen.getByText("A4 Portrait")).toBeInTheDocument();
  });
});
