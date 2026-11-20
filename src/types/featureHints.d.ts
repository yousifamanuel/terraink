/** Feature hints bundled at build time (see featureHintsPlugin in vite.config.js). */
declare module "virtual:feature-hints" {
  const hints: unknown[];
  export default hints;
}
