import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useLocale, LocaleProvider } from "@/core/i18n/LocaleContext";
import { vi } from "vitest";
import { useExport } from "@/features/export/application/useExport";
import { usePosterContext } from "@/features/poster/ui/PosterContext";
import MobileExportFab from "@/features/export/ui/MobileExportFab";
import { useRepoStars } from "@/shared/hooks/useRepoStars";

vi.mock("@/core/config", () => ({
  KOFI_URL: "https://ko-fi.com/terraink",
  REPO_API_URL: "https://api.github.com/repos/acme/terraink",
  REPO_URL: "https://github.com/acme/terraink",
  SOCIAL_INSTAGRAM: "https://instagram.com/terraink",
  SOCIAL_LINKEDIN: "https://linkedin.com/company/terraink",
  SOCIAL_REDDIT: "",
  SOCIAL_THREADS: "",
  SOCIAL_YOUTUBE: "",
}));

vi.mock("@/features/export/application/useExport", () => ({
  useExport: vi.fn(),
}));

vi.mock("@/features/poster/ui/PosterContext", () => ({
  usePosterContext: vi.fn(),
}));

vi.mock("@/shared/hooks/useRepoStars", () => ({
  useRepoStars: vi.fn(),
}));

const mockedUseExport = vi.mocked(useExport);
const mockedUsePosterContext = vi.mocked(usePosterContext);
const mockedUseRepoStars = vi.mocked(useRepoStars);

function LocaleButtons() {
  const { setLocale } = useLocale();

  return (
    <>
      <button type="button" onClick={() => setLocale("en")}>
        English
      </button>
      <button type="button" onClick={() => setLocale("zh-CN")}>
        中文
      </button>
    </>
  );
}

function renderWithLocale() {
  return render(
    <LocaleProvider>
      <LocaleButtons />
      <MobileExportFab />
    </LocaleProvider>,
  );
}

describe("MobileExportFab", () => {
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

    mockedUseExport.mockReturnValue({
      handleDownloadPng: vi.fn(),
      handleDownloadPdf: vi.fn(),
      handleDownloadSvg: vi.fn(),
      supportPrompt: null,
      dismissSupportPrompt: vi.fn(),
    });

    mockedUsePosterContext.mockReturnValue({
      state: {
        isExporting: false,
      },
    } as ReturnType<typeof usePosterContext>);

    mockedUseRepoStars.mockReturnValue({
      repoStars: 128,
      repoStarsLoading: false,
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("switches the export trigger, modal, and support copy to zh-CN", async () => {
    const user = userEvent.setup();

    Object.defineProperty(window, "innerHeight", {
      configurable: true,
      value: 1000,
    });
    Object.defineProperty(window, "scrollY", {
      configurable: true,
      value: 0,
    });
    Object.defineProperty(document.documentElement, "scrollHeight", {
      configurable: true,
      value: 3000,
    });

    renderWithLocale();

    expect(
      screen.getByRole("button", { name: "Export poster" }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Export poster" }));
    expect(screen.getByRole("heading", { name: "Download Poster" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Close export options" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Support the project")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "中文" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "中文" }));

    expect(
      screen.getByRole("button", { name: "导出海报" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "下载海报" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "关闭导出选项" }),
    ).toBeInTheDocument();
    expect(screen.getByText("支持这个项目")).toBeInTheDocument();

    cleanup();

    mockedUseExport.mockReturnValue({
      handleDownloadPng: vi.fn(),
      handleDownloadPdf: vi.fn(),
      handleDownloadSvg: vi.fn(),
      supportPrompt: { posterNumber: 5 },
      dismissSupportPrompt: vi.fn(),
    });

    window.localStorage.setItem("terraink.locale", "zh-CN");

    renderWithLocale();

    expect(
      screen.getByRole("link", { name: /在 Ko-fi 上支持/i }),
    ).toBeInTheDocument();
  });
});
