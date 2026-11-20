/** Campaign files bundled at build time (see campaignsPlugin in vite.config.js). */
declare module "virtual:campaigns" {
  const campaigns: Array<{
    id: string;
    manifest: unknown;
    themes: Record<string, unknown>;
  }>;
  export default campaigns;
}
