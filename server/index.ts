const EASTER_EGG_PARAM = "--l5z12";

const EASTER_EGG = `\
  l5z12@cloudflare:~$ whoami
  l5z12
  l5z12@cloudflare:~$ echo "nice try ;)"
  nice try ;)
  l5z12@cloudflare:~$ █`;

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.searchParams.has(EASTER_EGG_PARAM)) {
      return new Response(EASTER_EGG, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "X-Robots-Tag": "noindex",
        },
      });
    }

    if (url.pathname.startsWith("/api/")) {
      return handleApi(url);
    }

    return new Response(null, { status: 404 });
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

    case "security":
      return new Response(null, {
        status: 301,
        headers: { Location: "/security.json" },
      });

    default:
      return new Response(null, { status: 404 });
  }
}
