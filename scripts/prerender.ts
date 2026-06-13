/**
 * Prerender every known route to a static HTML file, plus the discovery
 * artifacts agents and crawlers look for.
 *
 * Reads:
 *   dist/server/entry-server.js  (built via `vite build --ssr`)
 *   dist/client/index.html       (Vite-emitted client shell)
 *
 * Writes under dist/client/ — Cloudflare's static asset serving picks these up
 * before falling through to the SPA shell / Worker.
 *
 *   /                                → index.html              + index.md
 *   /documents                       → documents/index.html    + documents/index.md
 *   /document/L5Z12-PERSONAL-001     → document/<id>/index.html + document/<id>/index.md
 *   /404                             → 404.html
 *
 *   sitemap.xml
 *   llms.txt
 *   .well-known/api-catalog          (RFC 9727)
 *   api/openapi.json                 (OpenAPI 3.1)
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = new URL("..", import.meta.url).pathname.replace(
  /^\/([A-Za-z]:)/,
  "$1",
);
const CLIENT_DIR = join(ROOT, "dist", "client");
const SERVER_ENTRY = join(ROOT, "dist", "server", "entry-server.js");
const TEMPLATE = join(CLIENT_DIR, "index.html");

interface Renderer {
  render(
    path: string,
  ): Promise<{ path: string; html: string; title: string; head: string }>;
  renderMarkdown(path: string): string | null;
  routes(): string[];
  sitemapXml(): string;
  llmsTxt(): string;
  apiCatalog(): string;
  openApiSpec(): string;
}

const mod = (await import(pathToFileURL(SERVER_ENTRY).href)) as Renderer;

const template = readFileSync(TEMPLATE, "utf-8");

function inject(
  template: string,
  html: string,
  title: string,
  head: string,
): string {
  return template
    .replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(title)}</title>`)
    .replace(/<!--app-head-->/, head)
    .replace(/<div id="app"><\/div>/, `<div id="app">${html}</div>`);
}

function escapeHtml(s: string): string {
  return s.replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[c]!,
  );
}

function htmlOutPathFor(route: string): string {
  if (route === "/") return join(CLIENT_DIR, "index.html");
  if (route === "/404") return join(CLIENT_DIR, "404.html");
  // /documents, /document/X → <path>/index.html (directory-style)
  return join(CLIENT_DIR, route.replace(/^\//, ""), "index.html");
}

function mdOutPathFor(route: string): string {
  if (route === "/") return join(CLIENT_DIR, "index.md");
  return join(CLIENT_DIR, route.replace(/^\//, ""), "index.md");
}

function write(outPath: string, contents: string): number {
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, contents);
  return contents.length;
}

let count = 0;
let bytes = 0;

for (const route of mod.routes()) {
  const { html, title, head } = await mod.render(route);
  const out = inject(template, html, title, head);
  const outPath = htmlOutPathFor(route);
  bytes += write(outPath, out);
  count++;
  console.log(`[prerender] ${route.padEnd(40)} → ${outPath}  (${out.length} B)`);

  const md = mod.renderMarkdown(route);
  if (md) {
    const mdPath = mdOutPathFor(route);
    write(mdPath, md);
    console.log(`[prerender] ${"".padEnd(40)} → ${mdPath}  (${md.length} B)`);
  }
}

// ── Discovery artifacts ──────────────────────────────────────────────────────
const artifacts: [string, string][] = [
  [join(CLIENT_DIR, "sitemap.xml"), mod.sitemapXml()],
  [join(CLIENT_DIR, "llms.txt"), mod.llmsTxt()],
  [join(CLIENT_DIR, ".well-known", "api-catalog"), mod.apiCatalog()],
  [join(CLIENT_DIR, "api", "openapi.json"), mod.openApiSpec()],
];

for (const [outPath, contents] of artifacts) {
  bytes += write(outPath, contents);
  console.log(
    `[prerender] ${"discovery".padEnd(40)} → ${outPath}  (${contents.length} B)`,
  );
}

console.log(
  `\n[prerender] ${count} route${count === 1 ? "" : "s"} + ${artifacts.length} discovery file${
    artifacts.length === 1 ? "" : "s"
  } written (${bytes} B total)`,
);
