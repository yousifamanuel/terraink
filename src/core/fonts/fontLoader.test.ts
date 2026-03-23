import { describe, expect, it } from "vitest";
import { ensureFontVariant } from "@/core/services";

describe("font loader", () => {
  it("loads the selected family variant descriptor", async () => {
    await ensureFontVariant({
      fontFamily: "Source Han Sans SC",
      fontVariant: "regular",
    });

    expect(
      document.head.querySelector(
        '[data-font-variant="Source Han Sans SC:regular"]',
      ),
    ).not.toBeNull();
  });
});
