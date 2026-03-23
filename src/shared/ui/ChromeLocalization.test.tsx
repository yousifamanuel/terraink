import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { LocaleProvider, useLocale } from "@/core/i18n/LocaleContext";
import FooterNote from "@/shared/ui/FooterNote";
import AboutModal from "@/shared/ui/AboutModal";
import PickerModal from "@/shared/ui/PickerModal";
import InstallPrompt from "@/features/install/ui/InstallPrompt";
import { useRepoStars } from "@/shared/hooks/useRepoStars";
import useInstallPrompt from "@/features/install/application/useInstallPrompt";

vi.mock("@/core/config", () => ({
  CONTACT_EMAIL: "hello@terraink.com",
  LEGAL_NOTICE_URL: "https://terraink.com/imprint",
  PRIVACY_URL: "https://terraink.com/privacy",
  REPO_API_URL: "https://api.github.com/repos/acme/terraink",
  REPO_URL: "https://github.com/acme/terraink",
  KOFI_URL: "https://ko-fi.com/terraink",
  SOCIAL_LINKEDIN: "https://linkedin.com/company/terraink",
  SOCIAL_INSTAGRAM: "https://instagram.com/terraink",
  SOCIAL_REDDIT: "",
  SOCIAL_THREADS: "",
  SOCIAL_YOUTUBE: "",
  INSTALL_DIAGNOSTICS_ENABLED: true,
}));

vi.mock("@/shared/hooks/useRepoStars", () => ({
  useRepoStars: vi.fn(),
}));

vi.mock("@/features/install/application/useInstallPrompt", () => ({
  default: vi.fn(),
}));

const mockedUseRepoStars = vi.mocked(useRepoStars);
const mockedUseInstallPrompt = vi.mocked(useInstallPrompt);
const originalLocalStorage = window.localStorage;

function LocaleControls() {
  const { setLocale } = useLocale();

  return (
    <>
      <button type="button" onClick={() => setLocale("en")}>
        Switch to English
      </button>
      <button type="button" onClick={() => setLocale("zh-CN")}>
        Switch to Chinese
      </button>
    </>
  );
}

function ChromeFixture() {
  return (
    <LocaleProvider>
      <LocaleControls />
      <FooterNote />
      <AboutModal onClose={vi.fn()} />
      <PickerModal open title="Test picker" onClose={vi.fn()}>
        <p>Picker body</p>
      </PickerModal>
      <InstallPrompt />
    </LocaleProvider>
  );
}

describe("Shared chrome localization", () => {
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

    mockedUseInstallPrompt.mockReturnValue({
      deferredPrompt: {} as Awaited<ReturnType<typeof useInstallPrompt>>["deferredPrompt"],
      showIosHint: false,
      showAndroidHint: false,
      dismissed: false,
      dismiss: vi.fn(),
      handleInstall: vi.fn(),
      diagnostics: {
        timestamp: "2026-03-23T00:00:00.000Z",
        userAgent: "test",
        isSecureContext: true,
        isIos: false,
        isAndroid: false,
        isStandaloneMode: false,
        deferredPromptAvailable: true,
        deferredPromptCached: false,
        beforeInstallPromptFired: true,
        promptOutcome: null,
        swControlled: true,
        swReady: true,
        dismissed: false,
      },
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: originalLocalStorage,
    });
  });

  it("switches footer, about panel, picker modal, and install prompt copy to zh-CN", async () => {
    const user = userEvent.setup();

    render(<ChromeFixture />);

    expect(screen.getByText("Imprint")).toBeInTheDocument();
    expect(screen.getByText("Data Privacy")).toBeInTheDocument();
    expect(screen.getByText(/Made with/)).toBeInTheDocument();
    expect(
      screen.getByRole("dialog", { name: "About TerraInk" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Help Us Grow")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Close Test picker" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Done" })).toBeInTheDocument();
    expect(
      screen.getByText("Install TerraInk for faster access and a better experience."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Add to Home Screen" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Maybe later" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Diagnostics" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Switch to Chinese" }));

    expect(screen.getByText("法律声明")).toBeInTheDocument();
    expect(screen.getByText("隐私政策")).toBeInTheDocument();
    expect(document.querySelector(".made-note")).toHaveTextContent(
      "用 ❤︎ 制作于德国汉诺威",
    );
    expect(
      screen.getByRole("dialog", { name: "关于 TerraInk" }),
    ).toBeInTheDocument();
    expect(screen.getByText("帮助我们成长")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "关闭 Test picker" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "完成" })).toBeInTheDocument();
    expect(screen.getByText("安装 TerraInk，获得更快访问和更好的体验。")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "添加到主屏幕" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "稍后再说" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "诊断信息" })).toBeInTheDocument();
  });
});
