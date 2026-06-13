import { createSSRApp } from "vue";
import { renderToString } from "@vue/server-renderer";
import App from "./App.vue";
import { setPath, parseRoute } from "./lib/router";
import { pageTitle } from "./lib/title";
import { renderHead } from "./lib/meta";
import { renderMarkdown as renderMarkdownForPath } from "./lib/markdown";
import { listDocuments } from "./lib/documents";

// Re-exported so the prerender step can emit discovery artifacts from the
// single SSR bundle it already imports.
export { sitemapXml, llmsTxt, apiCatalog, openApiSpec } from "./lib/discovery";

export interface RenderResult {
  /** Path that was rendered (normalised). */
  path: string;
  /** Rendered HTML to inject into <div id="app">…</div>. */
  html: string;
  /** Title for <title>…</title>. */
  title: string;
  /** Per-route <head> markup (meta, canonical, Open Graph, JSON-LD). */
  head: string;
}

/** Render the app for a single route to an HTML string. */
export async function render(path: string): Promise<RenderResult> {
  setPath(path);
  const route = parseRoute(path);
  const app = createSSRApp(App);
  const html = await renderToString(app);
  return { path, html, title: pageTitle(route), head: renderHead(route) };
}

/** Markdown rendering of a route (null when the route has no markdown form). */
export function renderMarkdown(path: string): string | null {
  return renderMarkdownForPath(path);
}

/** Routes the build pipeline should pre-render. */
export function routes(): string[] {
  const out = ["/", "/documents", "/404"];
  for (const doc of listDocuments()) {
    out.push(`/document/${doc.document.id}`);
  }
  return out;
}
