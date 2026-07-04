import type { APIRoute } from "astro";
import { renderMarkdown } from "@/lib/markdown";

// Markdown twin of the documents index → dist/documents/index.md
export const GET: APIRoute = () =>
  new Response(renderMarkdown("/documents") ?? "", {
    headers: { "content-type": "text/markdown; charset=utf-8" },
  });
