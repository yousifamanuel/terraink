import { beforeEach, describe, expect, it } from "vitest";
import {
  readPosterTypographyPreferences,
  writePosterTypographyPreferences,
} from "@/features/poster/infrastructure/posterPreferencesStorage";

describe("posterPreferencesStorage", () => {
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

  it("rehydrates saved poster typography with a valid default variant fallback", () => {
    window.localStorage.setItem(
      "terraink.poster.typography",
      JSON.stringify({
        fontFamily: "Source Han Sans SC",
        fontVariant: "missing",
      }),
    );

    expect(readPosterTypographyPreferences()).toEqual({
      fontFamily: "Source Han Sans SC",
      fontVariant: "regular",
    });
  });

  it("writes normalized typography preferences", () => {
    writePosterTypographyPreferences({
      fontFamily: "Source Han Sans SC",
      fontVariant: "heavy",
    });

    expect(readPosterTypographyPreferences()).toEqual({
      fontFamily: "Source Han Sans SC",
      fontVariant: "heavy",
    });
  });
});
