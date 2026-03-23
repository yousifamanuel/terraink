import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { vi } from "vitest";
import { LocaleProvider } from "@/core/i18n/LocaleContext";
import { useRepoStars } from "@/shared/hooks/useRepoStars";
import GeneralHeader from "@/shared/ui/GeneralHeader";
import DesktopNavBar from "@/shared/ui/DesktopNavBar";
import MobileNavBar, { type MobileTab } from "@/shared/ui/MobileNavBar";

vi.mock("@/core/config", () => ({
  KOFI_URL: "https://ko-fi.com/terraink",
  REPO_API_URL: "https://api.github.com/repos/acme/terraink",
  REPO_URL: "https://github.com/acme/terraink",
  SOCIAL_INSTAGRAM: "https://instagram.com/terraink",
}));

vi.mock("@/shared/hooks/useRepoStars", () => ({
  useRepoStars: vi.fn(),
}));

const mockedUseRepoStars = vi.mocked(useRepoStars);
const originalLocalStorage = window.localStorage;
const onAboutOpen = vi.fn();

function ShellFixture() {
  const [desktopTab, setDesktopTab] = useState<MobileTab>("theme");
  const [desktopPanelOpen, setDesktopPanelOpen] = useState(false);
  const [desktopLocationVisible, setDesktopLocationVisible] = useState(true);
  const [mobileTab, setMobileTab] = useState<MobileTab>("theme");
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [mobileLocationVisible, setMobileLocationVisible] = useState(true);

  return (
    <>
      <GeneralHeader onAboutOpen={onAboutOpen} />
      <DesktopNavBar
        activeTab={desktopTab}
        panelOpen={desktopPanelOpen}
        onTabChange={(nextTab) => {
          setDesktopTab(nextTab);
          setDesktopPanelOpen(true);
        }}
        isLocationVisible={desktopLocationVisible}
        onLocationToggle={() =>
          setDesktopLocationVisible((isVisible) => !isVisible)
        }
        onSettingsToggle={() => setDesktopPanelOpen((isOpen) => !isOpen)}
      />
      <MobileNavBar
        activeTab={mobileTab}
        drawerOpen={mobileDrawerOpen}
        isLocationVisible={mobileLocationVisible}
        onTabChange={(nextTab) => {
          if (nextTab === "location") {
            setMobileLocationVisible((isVisible) => !isVisible);
            setMobileDrawerOpen(false);
            return;
          }

          setMobileTab(nextTab);
          setMobileDrawerOpen(true);
        }}
        onSettingsToggle={() => setMobileDrawerOpen((isOpen) => !isOpen)}
      />
    </>
  );
}

function renderShell() {
  return render(
    <LocaleProvider>
      <ShellFixture />
    </LocaleProvider>,
  );
}

describe("LocaleSwitch", () => {
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
    mockedUseRepoStars.mockReturnValue({
      repoStars: 128,
      repoStarsLoading: false,
    });
    onAboutOpen.mockClear();
  });

  afterEach(() => {
    cleanup();
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: originalLocalStorage,
    });
  });

  it("renders English and 中文, then updates the shell copy when toggled", async () => {
    const user = userEvent.setup();

    renderShell();

    expect(screen.getByRole("button", { name: "English" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "中文" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "About" })).toBeInTheDocument();
    expect(
      screen.getByText("The Cartographic Poster Engine"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Hide location row" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Location" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Settings" })).toHaveLength(2);
    expect(screen.getByLabelText("Project links")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Open TerraInk repository on GitHub"),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "中文" }));

    expect(screen.getByRole("button", { name: "关于" })).toBeInTheDocument();
    expect(screen.getByText("制图海报引擎")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "隐藏位置行" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "位置" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "设置" })).toHaveLength(2);
    expect(screen.getByLabelText("项目链接")).toBeInTheDocument();
    expect(
      screen.getByLabelText("在 GitHub 上打开 TerraInk 仓库"),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "English" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(screen.getByRole("button", { name: "中文" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("keeps the original header action button and styles locale buttons like header actions", () => {
    renderShell();

    const englishButton = screen.getByRole("button", { name: "English" });
    const chineseButton = screen.getByRole("button", { name: "中文" });
    const aboutButton = screen.getByRole("button", { name: "About" });

    expect(aboutButton).toBeInTheDocument();
    expect(englishButton).toHaveClass("general-header-text-btn");
    expect(chineseButton).toHaveClass("general-header-text-btn");
    expect(aboutButton).toHaveClass("general-header-text-btn");
  });

  it("rehydrates the selected locale from storage after remount", async () => {
    const user = userEvent.setup();

    const { unmount } = renderShell();

    await user.click(screen.getByRole("button", { name: "中文" }));

    expect(window.localStorage.getItem("terraink.locale")).toBe("zh-CN");

    unmount();

    renderShell();

    expect(screen.getByRole("button", { name: "中文" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "关于" })).toBeInTheDocument();
    expect(screen.getByText("制图海报引擎")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "隐藏位置行" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "位置" })).toBeInTheDocument();
  });

  it("lets the settings buttons toggle the current desktop panel and mobile drawer", async () => {
    const user = userEvent.setup();

    renderShell();

    const [desktopSettingsButton, mobileSettingsButton] = screen.getAllByRole(
      "button",
      { name: "Settings" },
    );

    expect(desktopSettingsButton).not.toBeDisabled();
    expect(mobileSettingsButton).not.toBeDisabled();
    expect(desktopSettingsButton).toHaveAttribute("aria-pressed", "false");
    expect(mobileSettingsButton).toHaveAttribute("aria-pressed", "false");

    await user.click(desktopSettingsButton);

    expect(desktopSettingsButton).toHaveAttribute("aria-pressed", "true");

    await user.click(mobileSettingsButton);

    expect(mobileSettingsButton).toHaveAttribute("aria-pressed", "true");
    expect(screen.getAllByRole("button", { name: "Theme" })[1]).toHaveAttribute(
      "aria-current",
      "page",
    );
  });
});
