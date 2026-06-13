/**
 * Build-time generators for crawler / agent discovery artifacts:
 *   - sitemap.xml                      (sitemaps.org protocol)
 *   - llms.txt                         (llmstxt.org)
 *   - /.well-known/api-catalog         (RFC 9727, application/linkset+json)
 *   - /api/openapi.json                (OpenAPI 3.1 for the Worker API)
 *
 * These are written to dist/client during prerender (scripts/prerender.ts) so
 * they ship as static assets and stay in sync with the document set.
 */

import { listDocuments, getDefaultDocument } from "./documents";
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
  const intro =
    getDefaultDocument()?.document.summary ?? "Personal homepage of l5z12.";

  const lines = [`# ${SITE_NAME}`, "", `> ${intro}`, "", "## Documents", ""];

  for (const doc of listDocuments()) {
    const summary =
      doc.document.summary ??
      doc.sections.find((s) => s.id === "abstract")?.content ??
      "";
    lines.push(
      `- [${doc.document.id}](${SITE_ORIGIN}/document/${doc.document.id}): ${summary}`,
    );
  }

  lines.push(
    "",
    "## Resources",
    "",
    `- [API catalog](${SITE_ORIGIN}/.well-known/api-catalog): RFC 9727 API discovery (application/linkset+json)`,
    `- [OpenAPI specification](${SITE_ORIGIN}/api/openapi.json): machine-readable API description`,
    `- [Sitemap](${SITE_ORIGIN}/sitemap.xml): canonical URL list`,
    `- [PGP key](${SITE_ORIGIN}/l5z12.asc): signature verification and encrypted contact`,
    "",
    "## Notes",
    "",
    "Every page also returns Markdown when requested with the `Accept: text/markdown` header.",
    "",
  );

  return lines.join("\n");
}

export function openApiSpec(): string {
  const spec = {
    openapi: "3.1.0",
    info: {
      title: `${SITE_NAME} API`,
      version: "1.0.0",
      description:
        "Public, unauthenticated metadata endpoints served by the l5z12 Worker.",
    },
    servers: [{ url: `${SITE_ORIGIN}/api` }],
    paths: {
      "/info": {
        get: {
          summary: "Identity and contact metadata",
          operationId: "getInfo",
          responses: {
            "200": {
              description: "Identity record",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      handle: { type: "string" },
                      github: { type: "string", format: "uri" },
                      gitlab: { type: "string", format: "uri" },
                      gpg: { type: "string" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/health": {
        get: {
          summary: "Liveness probe",
          operationId: "getHealth",
          responses: {
            "200": {
              description: "Service is healthy",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: { status: { type: "string" } },
                  },
                },
              },
            },
          },
        },
      },
      "/security": {
        get: {
          summary: "Redirect to the build-time security manifest",
          operationId: "getSecurity",
          responses: {
            "301": { description: "Redirect to /security.json" },
          },
        },
      },
    },
  };
  return JSON.stringify(spec, null, 2) + "\n";
}

export function apiCatalog(): string {
  const linkset = {
    linkset: [
      {
        anchor: `${SITE_ORIGIN}/api`,
        "service-desc": [
          {
            href: `${SITE_ORIGIN}/api/openapi.json`,
            type: "application/json",
            title: "OpenAPI 3.1 specification",
          },
        ],
        "service-doc": [
          {
            href: `${SITE_ORIGIN}/llms.txt`,
            type: "text/markdown",
            title: "Human- and agent-readable site overview",
          },
        ],
        status: [
          {
            href: `${SITE_ORIGIN}/api/health`,
            type: "application/json",
            title: "Liveness probe",
          },
        ],
      },
    ],
  };
  return JSON.stringify(linkset, null, 2) + "\n";
}
