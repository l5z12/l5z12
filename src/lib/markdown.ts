/**
 * Markdown renderings of each route, used two ways:
 *   - prerendered to `*.md` files alongside the HTML (see scripts/prerender.ts)
 *   - served by the Worker under `Accept: text/markdown` content negotiation.
 *
 * Keep this in lock-step with the route map in src/lib/router.ts.
 */

import type { Document } from "@/types/document";
import { getDocument, getDefaultDocument, listDocuments } from "./documents";
import { SITE_ORIGIN, SITE_NAME } from "./site";

function summaryFor(doc: Document): string {
  if (doc.document.summary) return doc.document.summary;
  return doc.sections.find((s) => s.id === "abstract")?.content ?? "";
}

export function documentToMarkdown(doc: Document): string {
  const lines: string[] = [
    `# ${doc.identity.name}`,
    "",
    `**Document:** ${doc.document.id}  `,
    `**Status:** ${doc.document.status}  `,
    `**Updated:** ${doc.document.updated}`,
    "",
  ];

  for (const section of doc.sections) {
    const heading =
      section.number !== null
        ? `${section.number}. ${section.title}`
        : section.title;
    lines.push(`## ${heading}`, "");

    if (section.content) lines.push(section.content, "");

    for (const item of section.items ?? []) {
      if (item.type === "email") {
        lines.push(
          `- **${item.label}:** available on the website (obfuscated to deter scraping)`,
        );
      } else if (item.url) {
        lines.push(
          `- **${item.label}:** [${item.value || item.url}](${item.url})`,
        );
      } else {
        lines.push(`- **${item.label}:** ${item.value}`);
      }
    }
    if (section.items?.length) lines.push("");
  }

  return lines.join("\n").trimEnd() + "\n";
}

export function documentsToMarkdown(): string {
  const docs = listDocuments();
  const lines = [
    `# Documents — ${SITE_NAME}`,
    "",
    "Index of public documents. Each entry links to its full text.",
    "",
  ];
  for (const doc of docs) {
    lines.push(
      `- [${doc.document.id}](${SITE_ORIGIN}/document/${doc.document.id}) — ${summaryFor(doc)}`,
    );
  }
  lines.push("");
  return lines.join("\n");
}

/** Markdown for a route, or null when the route has no markdown form. */
export function renderMarkdown(path: string): string | null {
  const clean = path.replace(/\/+$/, "") || "/";

  if (clean === "/") {
    const doc = getDefaultDocument();
    return doc ? documentToMarkdown(doc) : `# ${SITE_NAME}\n`;
  }

  if (clean === "/documents") return documentsToMarkdown();

  const docMatch = clean.match(/^\/document\/([^/]+)$/);
  if (docMatch) {
    const doc = getDocument(decodeURIComponent(docMatch[1]!));
    return doc ? documentToMarkdown(doc) : null;
  }

  return null;
}
