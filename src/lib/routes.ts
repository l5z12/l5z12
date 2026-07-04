/**
 * Framework-agnostic route model. Formerly the pure half of the Vue
 * `router.ts`; the reactive/DOM navigation half is gone now that the site is a
 * static MPA (plain <a> links, full-page navigation, no client router).
 *
 * `pageMeta` (meta.ts) and `pageTitle` (title.ts) consume a `Route`; each Astro
 * page builds the matching `Route` for itself.
 */

export interface Route {
  path: string;
  name: "home" | "documents" | "document" | "not-found";
  params: Record<string, string>;
}

export function parseRoute(path: string): Route {
  const clean = path.replace(/\/+$/, "") || "/";

  if (clean === "/") return { path: clean, name: "home", params: {} };
  if (clean === "/documents")
    return { path: clean, name: "documents", params: {} };

  const docMatch = clean.match(/^\/document\/([^/]+)$/);
  if (docMatch) {
    return {
      path: clean,
      name: "document",
      params: { id: decodeURIComponent(docMatch[1]!) },
    };
  }

  return { path: clean, name: "not-found", params: {} };
}
