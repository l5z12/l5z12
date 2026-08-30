/**
 * Build-time generators for crawler / agent discovery artifacts:
 *   - sitemap.xml    (sitemaps.org protocol)
 *   - llms.txt       (llmstxt.org)
 *
 * Emitted as Astro static endpoints (src/pages/sitemap.xml.ts, llms.txt.ts) so
 * they ship as static assets and stay in sync with the document set.
 */

import { listDocuments, getDefaultDocument } from "./documents";
import { plainText } from "./prose";
import { SITE_ORIGIN, SITE_NAME, updatedToIso } from "./site";

export function sitemapXml(): string {
  const docs = listDocuments();
  const docDates = docs
    .map((d) => updatedToIso(d.document.updated))
    .filter((d): d is string => d !== null)
    .sort();
  const latest = docDates[docDates.length - 1];

  const entries: { loc: string; lastmod?: string }[] = [
    { loc: `${SITE_ORIGIN}/`, lastmod: latest },
    { loc: `${SITE_ORIGIN}/documents`, lastmod: latest },
    ...docs.map((d) => ({
      loc: `${SITE_ORIGIN}/document/${d.document.id}`,
      lastmod: updatedToIso(d.document.updated) ?? undefined,
    })),
  ];

  const body = entries
    .map(
      (u) =>
        `  <url>\n    <loc>${u.loc}</loc>` +
        (u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : "") +
        `\n  </url>`,
    )
    .join("\n");

  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    `${body}\n</urlset>\n`
  );
}

export function llmsTxt(): string {
  const summary = getDefaultDocument()?.document.summary;
  const intro = summary ? plainText(summary) : "Personal homepage of l5z12.";

  const lines = [`# ${SITE_NAME}`, "", `> ${intro}`, "", "## Documents", ""];

  for (const doc of listDocuments()) {
    // One entry per line: a Markdown abstract can run to several paragraphs,
    // which would break the list, so it is flattened to a single line of text.
    const source =
      doc.document.summary ??
      doc.sections.find((s) => s.id === "abstract")?.content;
    const summary = source ? plainText(source) : "";
    lines.push(
      `- [${doc.document.id}](${SITE_ORIGIN}/document/${doc.document.id}): ${summary}`,
    );
  }

  lines.push(
    "",
    "## Resources",
    "",
    `- [Sitemap](${SITE_ORIGIN}/sitemap.xml): canonical URL list`,
    `- [PGP key](${SITE_ORIGIN}/l5z12.asc): signature verification and encrypted contact`,
    "",
    "## Notes",
    "",
    "A Markdown version of each page is published alongside it: append `.md` " +
      "to any page path (e.g. `/index.md`, `/documents.md`, " +
      "`/document/<id>.md`).",
    "",
  );

  return lines.join("\n");
}
