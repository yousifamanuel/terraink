export interface FontVariantDefinition {
  id: string;
  label: string;
  weight: number;
  style?: "normal" | "italic";
}

export interface GoogleFontSource {
  kind: "google";
  families: string[];
}

export interface ExternalCssFontSource {
  kind: "external-css";
  href: string;
}

export type FontSourceDefinition =
  | GoogleFontSource
  | ExternalCssFontSource;

export interface FontFamilyDefinition {
  id: string;
  label: string;
  titleFamily: string;
  bodyFamily: string;
  titleFallback: string;
  bodyFallback: string;
  defaultVariantId: string;
  variants: FontVariantDefinition[];
  source?: FontSourceDefinition;
}

export interface FontSelection {
  fontFamily?: string | null;
  fontVariant?: string | null;
}

export interface ResolvedFontSelection {
  family: FontFamilyDefinition;
  variant: FontVariantDefinition;
}
