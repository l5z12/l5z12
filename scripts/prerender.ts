/**
 * Prerender every known route to a static HTML file.
 *
 * Reads:
 *   dist/server/entry-server.js  (built via `vite build --ssr`)
 *   dist/client/index.html       (Vite-emitted client shell)
 *
 * Writes one HTML file per route under dist/client/ — Cloudflare's static
 * asset serving picks them up before falling through to the SPA shell.
 *
 *   /                                → dist/client/index.html
 *   /documents                       → dist/client/documents/index.html
 *   /document/L5Z12-PERSONAL-001     → dist/client/document/L5Z12-PERSONAL-001/index.html
 *   /404                             → dist/client/404.html
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
  render(path: string): Promise<{ path: string; html: string; title: string }>;
  routes(): string[];
}

const mod = (await import(pathToFileURL(SERVER_ENTRY).href)) as Renderer;

const template = readFileSync(TEMPLATE, "utf-8");

function inject(template: string, html: string, title: string): string {
  return template
    .replace(
      /<title>[^<]*<\/title>/,
      `<title>${escapeHtml(title)}</title>`,
    )
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

function outPathFor(route: string): string {
  if (route === "/") return join(CLIENT_DIR, "index.html");
  if (route === "/404") return join(CLIENT_DIR, "404.html");
  // /documents, /document/X → <path>/index.html (directory-style)
  return join(CLIENT_DIR, route.replace(/^\//, ""), "index.html");
}

let count = 0;
let bytes = 0;

for (const route of mod.routes()) {
  const { html, title } = await mod.render(route);
  const out = inject(template, html, title);
  const outPath = outPathFor(route);
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, out);
  count++;
  bytes += out.length;
  console.log(`[prerender] ${route.padEnd(40)} → ${outPath}  (${out.length} B)`);
}

console.log(
  `\n[prerender] ${count} route${count === 1 ? "" : "s"} rendered (${bytes} B total)`,
);
