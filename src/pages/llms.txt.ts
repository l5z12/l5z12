import type { APIRoute } from "astro";
import { llmsTxt } from "@/lib/discovery";

export const GET: APIRoute = () =>
  new Response(llmsTxt(), {
    headers: { "content-type": "text/markdown; charset=utf-8" },
  });
