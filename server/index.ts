const EASTER_EGG_PARAM = "--l5z12";

const EASTER_EGG = `\
  l5z12@cloudflare:~$ whoami
  l5z12
  l5z12@cloudflare:~$ echo "nice try ;)"
  nice try ;)
  l5z12@cloudflare:~$ █`;

// Advertised to agents on every Worker-served HTML/Markdown response. `_headers`
// covers the remaining static assets (see public/_headers).
const LINK_HEADER = [
  '</.well-known/api-catalog>; rel="api-catalog"',
  '</llms.txt>; rel="describedby"; type="text/markdown"',
  '</sitemap.xml>; rel="sitemap"; type="application/xml"',
].join(", ");

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.searchParams.has(EASTER_EGG_PARAM)) {
      return new Response(EASTER_EGG, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "X-Robots-Tag": "noindex",
        },
      });
    }

    if (url.pathname === "/api" || url.pathname.startsWith("/api/")) {
      return handleApi(url);
    }

    // Markdown-for-agents: serve the prerendered .md twin when the client
    // prefers Markdown over HTML. Browsers (Accept: text/html…) fall through.
    const mdPath = markdownPathFor(url.pathname);
    if (mdPath && prefersMarkdown(request.headers.get("Accept"))) {
      const mdRes = await env.ASSETS.fetch(new URL(mdPath, url.origin));
      if (mdRes.ok) {
        const body = await mdRes.text();
        return withDiscoveryHeaders(
          new Response(body, {
            status: 200,
            headers: {
              "Content-Type": "text/markdown; charset=utf-8",
              "X-Markdown-Tokens": String(estimateTokens(body)),
            },
          }),
        );
      }
    }

    // Default: serve the matching static asset (prerendered HTML for known
    // routes, SPA shell otherwise) and advertise agent resources.
    return withDiscoveryHeaders(await env.ASSETS.fetch(request));
  },
} satisfies ExportedHandler<Env>;

function handleApi(url: URL): Response {
  const path = url.pathname.replace(/^\/api\/?/, "");

  switch (path) {
    case "info":
      return Response.json({
        handle: "l5z12",
        github: "https://github.com/l5z12",
        gitlab: "https://gitlab.com/l5z12",
        gpg: "/l5z12.asc",
      });

    case "health":
      return Response.json({ status: "ok" });

    case "security":
      return new Response(null, {
        status: 301,
        headers: { Location: "/security.json" },
      });

    default:
      return new Response(null, { status: 404 });
  }
}

/** Map a route to its prerendered Markdown twin, or null if it has none. */
function markdownPathFor(pathname: string): string | null {
  const clean = pathname.replace(/\/+$/, "") || "/";
  if (clean === "/") return "/index.md";
  if (clean === "/documents") return "/documents/index.md";
  if (/^\/document\/[^/]+$/.test(clean)) return `${clean}/index.md`;
  return null;
}

/** True when the Accept header ranks Markdown at least as high as HTML. */
function prefersMarkdown(accept: string | null): boolean {
  if (!accept) return false;

  let markdownQ = -1;
  let htmlQ = -1;

  for (const part of accept.split(",")) {
    const [rawType, ...params] = part.trim().split(";");
    const type = rawType!.trim().toLowerCase();

    let q = 1;
    for (const param of params) {
      const match = param.trim().match(/^q=([0-9.]+)$/);
      if (match) q = parseFloat(match[1]!);
    }

    if (type === "text/markdown" || type === "text/x-markdown") {
      markdownQ = Math.max(markdownQ, q);
    } else if (type === "text/html" || type === "application/xhtml+xml") {
      htmlQ = Math.max(htmlQ, q);
    }
  }

  return markdownQ >= 0 && markdownQ >= htmlQ;
}

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/** Add Link + Vary headers without disturbing the asset body/status. */
function withDiscoveryHeaders(res: Response): Response {
  const out = new Response(res.body, res);
  out.headers.set("Link", LINK_HEADER);
  const vary = out.headers.get("Vary");
  out.headers.set("Vary", vary ? `${vary}, Accept` : "Accept");
  return out;
}
