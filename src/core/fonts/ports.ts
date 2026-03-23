import type { FontSelection } from "./types";

export interface IFontLoader {
  ensureFont(selection: FontSelection): Promise<void>;
}
