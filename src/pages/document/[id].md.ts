import type { APIRoute } from "astro";
import { allDocuments } from "@/lib/documents";
import { renderMarkdown } from "@/lib/markdown";

// Markdown twin per document → dist/document/<id>.md (i.e. /document/<id>.md)
export function getStaticPaths() {
  return allDocuments().map((d) => ({ params: { id: d.document.id } }));
}

export const GET: APIRoute = ({ params }) =>
  new Response(renderMarkdown(`/document/${params.id}`) ?? "", {
    headers: { "content-type": "text/markdown; charset=utf-8" },
  });
