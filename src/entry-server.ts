import { createSSRApp } from "vue";
import { renderToString } from "@vue/server-renderer";
import App from "./App.vue";
import { setPath, parseRoute } from "./lib/router";
import { pageTitle } from "./lib/title";
import { listDocuments } from "./lib/documents";

export interface RenderResult {
  /** Path that was rendered (normalised). */
  path: string;
  /** Rendered HTML to inject into <div id="app">…</div>. */
  html: string;
  /** Title for <title>…</title>. */
  title: string;
}

/** Render the app for a single route to an HTML string. */
export async function render(path: string): Promise<RenderResult> {
  setPath(path);
  const route = parseRoute(path);
  const app = createSSRApp(App);
  const html = await renderToString(app);
  return { path, html, title: pageTitle(route) };
}

/** Routes the build pipeline should pre-render. */
export function routes(): string[] {
  const out = ["/", "/documents", "/404"];
  for (const doc of listDocuments()) {
    out.push(`/document/${doc.document.id}`);
  }
  return out;
}
