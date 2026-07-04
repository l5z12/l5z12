import type { APIRoute } from "astro";
import { renderMarkdown } from "@/lib/markdown";

// Markdown twin of the home page → dist/index.md
export const GET: APIRoute = () =>
  new Response(renderMarkdown("/") ?? "", {
    headers: { "content-type": "text/markdown; charset=utf-8" },
  });
