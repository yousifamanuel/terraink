export interface IFontLoader {
  ensureFont(family: string): Promise<void>;
}
