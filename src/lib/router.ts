import { ref, computed, type ComputedRef } from "vue";

export interface Route {
  path: string;
  name: "home" | "documents" | "document" | "not-found";
  params: Record<string, string>;
}

function parse(path: string): Route {
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

const currentPath = ref<string>(
  typeof window !== "undefined" ? window.location.pathname : "/",
);

export const currentRoute: ComputedRef<Route> = computed(() =>
  parse(currentPath.value),
);

export function navigate(to: string, replace = false) {
  if (typeof window === "undefined") return;
  if (to === currentPath.value) return;
  if (replace) {
    window.history.replaceState({}, "", to);
  } else {
    window.history.pushState({}, "", to);
  }
  currentPath.value = to;
  window.scrollTo({ top: 0, behavior: "instant" });
}

let installed = false;

/**
 * Initialise the router. Listens for back/forward and intercepts clicks on
 * same-origin <a> elements so internal navigation does not trigger a full
 * page reload.
 */
export function installRouter() {
  if (installed || typeof window === "undefined") return;
  installed = true;

  window.addEventListener("popstate", () => {
    currentPath.value = window.location.pathname;
  });

  document.addEventListener("click", (event) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    const anchor = (event.target as Element | null)?.closest("a");
    if (!anchor) return;

    const href = anchor.getAttribute("href");
    if (!href || href.startsWith("#")) return;
    if (anchor.target && anchor.target !== "_self") return;
    if (anchor.hasAttribute("download")) return;
    if (anchor.getAttribute("rel")?.includes("external")) return;

    const url = new URL(anchor.href, window.location.origin);
    if (url.origin !== window.location.origin) return;

    // Only intercept paths the router knows about. Static assets like
    // /l5z12.asc, /favicon.ico etc. should fall through to a real request.
    const route = parse(url.pathname);
    if (route.name === "not-found") return;

    event.preventDefault();
    navigate(url.pathname + url.search + url.hash);
  });
}
