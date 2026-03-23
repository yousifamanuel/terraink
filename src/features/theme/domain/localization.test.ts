import { describe, expect, it } from "vitest";
import {
  localizeThemeName,
  localizeLayoutName,
  localizeLayoutCategoryName,
} from "@/features/theme/domain/localization";

describe("theme and layout localization helpers", () => {
  it("returns Chinese names for known theme and layout ids in zh-CN", () => {
    expect(localizeThemeName("zh-CN", "midnight_blue", "Midnight Blue")).toBe(
      "午夜蓝",
    );
    expect(localizeLayoutName("zh-CN", "print_a4_portrait", "A4 Portrait")).toBe(
      "A4 纵向",
    );
    expect(localizeLayoutCategoryName("zh-CN", "print", "Print")).toBe("打印");
  });

  it("falls back to the provided English labels when no Chinese translation exists", () => {
    expect(localizeThemeName("zh-CN", "unknown_theme", "Unknown Theme")).toBe(
      "Unknown Theme",
    );
    expect(localizeLayoutName("zh-CN", "unknown_layout", "Unknown Layout")).toBe(
      "Unknown Layout",
    );
  });
});
