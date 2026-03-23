import { render, screen } from "@testing-library/react";
import { fontCatalog, getFontVariantOptions } from "@/core/fonts/catalog";
import { LocaleProvider } from "@/core/i18n/LocaleContext";
import TypographySection from "@/features/poster/ui/TypographySection";

describe("TypographySection", () => {
  it("renders family and variant selectors", () => {
    render(
      <LocaleProvider>
        <TypographySection
          {...({
            form: {
              showPosterText: true,
              showMarkers: true,
              displayCity: "Hanover",
              displayCountry: "Germany",
              fontFamily: "",
              fontVariant: "regular",
            },
            onChange: () => undefined,
            fontFamilies: fontCatalog,
            fontVariants: getFontVariantOptions(""),
            onCreditsChange: () => undefined,
          } as any)}
        />
      </LocaleProvider>,
    );

    expect(screen.getByLabelText("Font family")).toBeInTheDocument();
    expect(screen.getByLabelText("Font style")).toBeInTheDocument();
    expect(screen.queryByLabelText(/^Font$/i)).not.toBeInTheDocument();
  });
});
