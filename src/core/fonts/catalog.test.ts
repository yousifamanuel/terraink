import { describe, expect, it } from "vitest";
import { resolveFontSelection } from "@/core/fonts/catalog";

describe("font catalog", () => {
  it("falls back to the default variant when the saved variant is not available", () => {
    const resolved = resolveFontSelection({
      fontFamily: "Source Han Sans SC",
      fontVariant: "missing",
    });

    expect(resolved.family.id).toBe("Source Han Sans SC");
    expect(resolved.variant.id).toBe("regular");
  });
});
