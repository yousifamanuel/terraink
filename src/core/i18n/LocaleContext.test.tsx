import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useLocale, LocaleProvider } from "@/core/i18n/LocaleContext";

const originalNavigatorLanguage = navigator.language;
let store: Map<string, string>;

function setNavigatorLanguage(language: string) {
  Object.defineProperty(window.navigator, "language", {
    configurable: true,
    value: language,
  });
}

function TestConsumer() {
  const { locale, setLocale, t } = useLocale();

  return (
    <div>
      <p>{t("nav.about")}</p>
      <p>{t("nav.home")}</p>
      <p>{t("test.fallbackOnly")}</p>
      <p aria-label="active-locale">{locale}</p>
      <button type="button" onClick={() => setLocale("en")}>
        English
      </button>
      <button type="button" onClick={() => setLocale("zh-CN")}>
        中文
      </button>
    </div>
  );
}

describe("LocaleProvider", () => {
  beforeEach(() => {
    store = new Map();
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
    setNavigatorLanguage(originalNavigatorLanguage);
  });

  afterEach(() => {
    cleanup();
    setNavigatorLanguage(originalNavigatorLanguage);
  });

  it("defaults to english on first run even if the browser language is zh-CN", () => {
    setNavigatorLanguage("zh-CN");

    render(
      <LocaleProvider>
        <TestConsumer />
      </LocaleProvider>,
    );

    expect(screen.getByLabelText("active-locale")).toHaveTextContent("en");
    expect(screen.getByText("About")).toBeInTheDocument();
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Fallback only")).toBeInTheDocument();
  });

  it("switching to zh-CN persists", async () => {
    const user = userEvent.setup();

    const { unmount } = render(
      <LocaleProvider>
        <TestConsumer />
      </LocaleProvider>,
    );

    await user.click(screen.getByRole("button", { name: "中文" }));

    expect(screen.getByLabelText("active-locale")).toHaveTextContent("zh-CN");
    expect(screen.getByText("关于")).toBeInTheDocument();
    expect(screen.getByText("首页")).toBeInTheDocument();
    expect(screen.getByText("Fallback only")).toBeInTheDocument();
    expect(window.localStorage.getItem("terraink.locale")).toBe("zh-CN");

    unmount();

    render(
      <LocaleProvider>
        <TestConsumer />
      </LocaleProvider>,
    );

    expect(screen.getByLabelText("active-locale")).toHaveTextContent("zh-CN");
    expect(screen.getByText("关于")).toBeInTheDocument();
    expect(screen.getByText("首页")).toBeInTheDocument();
    expect(screen.getByText("Fallback only")).toBeInTheDocument();
  });

  it("falls back to english when a zh-CN key is missing", async () => {
    const user = userEvent.setup();

    render(
      <LocaleProvider>
        <TestConsumer />
      </LocaleProvider>,
    );

    await user.click(screen.getByRole("button", { name: "中文" }));

    expect(screen.getByText("Fallback only")).toBeInTheDocument();
    expect(screen.getByText("首页")).toBeInTheDocument();
  });
});
