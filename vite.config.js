import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";

const packageJson = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "package.json"), "utf8"),
);
const appVersion = String(packageJson.version ?? "0.0.0");
const MAPLIBRE_DEP_PACKAGES = new Set([
  "earcut",
  "gl-matrix",
  "kdbush",
  "murmurhash-js",
  "pbf",
  "potpack",
  "quickselect",
  "supercluster",
  "tinyqueue",
]);

function getPackageName(id) {
  const nodeModulesMatch = id.match(/[\\/]node_modules[\\/](.*)$/);
  if (!nodeModulesMatch || !nodeModulesMatch[1]) return null;

  const modulePath = nodeModulesMatch[1];
  const parts = modulePath.split(/[\\/]/);
  if (parts.length === 0) return null;

  if (parts[0].startsWith("@") && parts.length > 1) {
    return `${parts[0]}/${parts[1]}`;
  }

  return parts[0];
}

/**
 * Wires up AdSense: the loader script in index.html, and the ads.txt seller
 * line that authorises Google to sell this site's inventory.
 *
 * The script tag is emitted from here rather than interpolated into the HTML
 * so an unset client ID omits it entirely, instead of leaving a literal
 * %VITE_…% placeholder that the browser would request and 404 on.
 */
function adsensePlugin() {
  const SCRIPT_MARKER = "<!-- adsense-script -->";

  let resolvedConfig;

  return {
    name: "adsense",
    configResolved(config) {
      resolvedConfig = config;
    },
    transformIndexHtml(html) {
      const client = String(
        resolvedConfig.env.VITE_ADSENSE_AD_CLIENT ?? "",
      ).trim();
      return html.replace(
        SCRIPT_MARKER,
        client
          ? `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}" crossorigin="anonymous"></script>`
          : "",
      );
    },
    closeBundle() {
      const publisherId = String(
        resolvedConfig.env.VITE_ADSENSE_PUBLISHER_ID ?? "",
      ).trim();
      if (!publisherId) {
        console.warn(
          "[adsense] VITE_ADSENSE_PUBLISHER_ID is not set — skipping ads.txt",
        );
        return;
      }
      const outDir = path.resolve(
        resolvedConfig.root,
        resolvedConfig.build.outDir,
      );
      fs.writeFileSync(
        path.join(outDir, "ads.txt"),
        `google.com, ${publisherId}, DIRECT, f08c47fec0942fa0\n`,
        "utf8",
      );
      console.log("[adsense] wrote ads.txt");
    },
  };
}

/**
 * Renders the legal markdown docs from the meta repo into standalone HTML
 * pages at /privacy and /imprint (served from disk in builds, on demand in dev).
 *
 * The in-app modal fetches the same markdown live, so users always see the
 * current text; these static pages exist so the policies have a real,
 * crawlable URL — ad networks require the privacy policy to be linked from
 * the homepage, and a JS-only modal is invisible to their reviewers.
 */
function legalPagesPlugin() {
  const DOCS = [
    { slug: "privacy", envVar: "VITE_PRIVACY_URL", title: "Privacy Policy" },
    { slug: "imprint", envVar: "VITE_LEGAL_NOTICE_URL", title: "Imprint" },
    {
      slug: "privacy-app",
      envVar: "VITE_PRIVACY_APP_URL",
      title: "App Privacy Policy",
    },
  ];

  let resolvedConfig;
  let renderMarkdown;

  const pageTemplate = (title, body) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title} – Terraink</title>
    <link rel="icon" type="image/svg+xml" href="/assets/logo.svg" />
    <style>
      body {
        margin: 0;
        padding: 40px 20px 64px;
        background: #0a1824;
        color: rgba(214, 228, 240, 0.92);
        font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
        line-height: 1.6;
      }
      main { max-width: 720px; margin: 0 auto; }
      h1, h2, h3 { color: #fff; line-height: 1.25; margin: 1.4em 0 0.5em; }
      h1 { font-size: 1.6rem; }
      h2 { font-size: 1.2rem; }
      h3 { font-size: 1.05rem; }
      main > :first-child { margin-top: 0; }
      a { color: #7fb4e6; word-break: break-word; }
      ul, ol { padding-left: 1.4em; }
      hr { border: none; border-top: 1px solid rgba(151, 183, 207, 0.22); margin: 1.6em 0; }
      code { background: rgba(151, 183, 207, 0.14); padding: 0.1em 0.35em; border-radius: 4px; }
      .back-link { display: inline-block; margin-bottom: 28px; font-size: 0.9rem; }
    </style>
  </head>
  <body>
    <main>
      <a class="back-link" href="/">&larr; Back to Terraink</a>
${body}
    </main>
  </body>
</html>
`;

  async function buildPage(doc) {
    const url = resolvedConfig.env[doc.envVar];
    if (!url) {
      console.warn(
        `[legal-pages] ${doc.envVar} is not set — skipping /${doc.slug}`,
      );
      return null;
    }

    if (!renderMarkdown) {
      // Imported lazily so a build that skips both docs pays nothing.
      const [
        { unified },
        remarkParse,
        remarkBreaks,
        remarkRehype,
        rehypeStringify,
      ] = await Promise.all([
        import("unified"),
        import("remark-parse"),
        import("remark-breaks"),
        import("remark-rehype"),
        import("rehype-stringify"),
      ]);
      // remark-breaks matches the in-app LegalModal, so single line breaks
      // (e.g. Purpose / Legal Basis) render the same on both.
      const processor = unified()
        .use(remarkParse.default)
        .use(remarkBreaks.default)
        .use(remarkRehype.default)
        .use(rehypeStringify.default);
      renderMarkdown = async (markdown) =>
        String(await processor.process(markdown));
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return pageTemplate(doc.title, await renderMarkdown(await response.text()));
  }

  return {
    name: "legal-pages",
    configResolved(config) {
      resolvedConfig = config;
    },
    // Serve the pages on demand in `vite dev`, where there is no build step.
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const pathname = (req.url ?? "").split("?")[0].replace(/\/$/, "");
        const doc = DOCS.find((entry) => pathname === `/${entry.slug}`);
        if (!doc) return next();

        try {
          const html = await buildPage(doc);
          if (!html) return next();
          res.setHeader("Content-Type", "text/html; charset=utf-8");
          res.end(html);
        } catch (error) {
          console.warn(
            `[legal-pages] dev render failed for /${doc.slug}: ${error.message}`,
          );
          next();
        }
      });
    },
    async closeBundle() {
      const outDir = path.resolve(
        resolvedConfig.root,
        resolvedConfig.build.outDir,
      );

      for (const doc of DOCS) {
        try {
          const html = await buildPage(doc);
          if (!html) continue;
          // Directory-style output so the page is served at /privacy rather
          // than /privacy.html, without relying on host-specific rewrites.
          const pageDir = path.join(outDir, doc.slug);
          fs.mkdirSync(pageDir, { recursive: true });
          fs.writeFileSync(
            path.join(pageDir, "index.html"),
            html,
            "utf8",
          );
          console.log(`[legal-pages] wrote /${doc.slug}`);
        } catch (error) {
          // Don't fail the build on a transient fetch problem, but make it
          // loud — a missing policy page breaks ad-network review.
          console.warn(
            `[legal-pages] FAILED to build /${doc.slug}: ${error.message}`,
          );
        }
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), adsensePlugin(), legalPagesPlugin()],
  define: {
    "import.meta.env.VITE_APP_VERSION": JSON.stringify(appVersion),
  },
  build: {
    // maplibre-gl is distributed as a large prebundled module and remains a
    // single chunk even with manual chunking.
    chunkSizeWarningLimit: 1100,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          const packageName = getPackageName(id);

          if (packageName === "maplibre-gl") {
            return "vendor-maplibre-core";
          }

          if (
            packageName?.startsWith("@maplibre/") ||
            packageName?.startsWith("@mapbox/") ||
            MAPLIBRE_DEP_PACKAGES.has(packageName)
          ) {
            return "vendor-maplibre-deps";
          }

          if (packageName?.startsWith("react-icons")) {
            return "vendor-icons";
          }

          if (
            packageName === "react" ||
            packageName === "react-dom" ||
            packageName === "react-colorful"
          ) {
            return "vendor-react";
          }
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
