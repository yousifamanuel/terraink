import type { ParsedGpx } from "./types";

export interface IGpxParserPort {
  parse(xml: string, fallbackLabel?: string): ParsedGpx;
}
