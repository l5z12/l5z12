/**
 * Per-route SEO / agent-discovery head metadata.
 *
 * `pageMeta` is the single source of truth: each Astro page builds its `Route`
 * and the Base layout renders these values into the static `<head>`.
 */

import type { Route } from "./routes";
import type { Document } from "@/types/document";
import { pageTitle } from "./title";
import { getDocument, getDefaultDocument, listDocuments } from "./documents";
import { SITE_ORIGIN, SITE_NAME, SITE_IMAGE, updatedToIso } from "./site";

const DEFAULT_DESCRIPTION =
  "Personal homepage of l5z12 — identity, contact links, and cryptographic material.";

export interface PageMeta {
  title: string;
  description: string;
  /** Absolute canonical URL. */
  canonical: string;
  ogType: string;
  /** Whether the page should be indexed by crawlers. */
  index: boolean;
  /** schema.org JSON-LD blocks for this route. */
  jsonLd: Record<string, unknown>[];
}

function docDescription(doc: Document): string {
  if (doc.document.summary) return doc.document.summary;
  return (
    doc.sections.find((s) => s.id === "abstract")?.content ??
    DEFAULT_DESCRIPTION
  );
}

/** External identity URLs (rel="me") across listed documents — for `sameAs`. */
function sameAs(): string[] {
  const urls = new Set<string>();
  for (const doc of listDocuments()) {
    for (const section of doc.sections) {
      for (const item of section.items ?? []) {
        if (
          item.url &&
          /^https?:\/\//.test(item.url) &&
          item.rel?.split(/\s+/).includes("me")
        ) {
          urls.add(item.url);
        }
      }
    }
  }
  return [...urls];
}

function personLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: SITE_NAME,
    url: `${SITE_ORIGIN}/`,
    image: SITE_IMAGE,
    sameAs: sameAs(),
  };
}

export function pageMeta(route: Route): PageMeta {
  const title = pageTitle(route);

  if (route.name === "home") {
    const doc = getDefaultDocument();
    return {
      title,
      description: doc ? docDescription(doc) : DEFAULT_DESCRIPTION,
      canonical: `${SITE_ORIGIN}/`,
      ogType: "profile",
      index: true,
      jsonLd: [
        {
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: SITE_NAME,
          url: `${SITE_ORIGIN}/`,
        },
        personLd(),
      ],
    };
  }

  if (route.name === "documents") {
    const docs = listDocuments();
    const canonical = `${SITE_ORIGIN}/documents`;
    return {
      title,
      description: "Index of public documents published by l5z12.",
      canonical,
      ogType: "website",
      index: true,
      jsonLd: [
        {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Documents",
          url: canonical,
          hasPart: docs.map((d) => ({
            "@type": "CreativeWork",
            name: d.document.id,
            url: `${SITE_ORIGIN}/document/${d.document.id}`,
            abstract: docDescription(d),
          })),
        },
      ],
    };
  }

  if (route.name === "document") {
    const doc = getDocument(route.params.id ?? "");
    if (doc) {
      const canonical = `${SITE_ORIGIN}/document/${doc.document.id}`;
      const modified = updatedToIso(doc.document.updated);
      return {
        title,
        description: docDescription(doc),
        canonical,
        ogType: "profile",
        index: !doc.document.unlisted,
        jsonLd: [
          {
            "@context": "https://schema.org",
            "@type": "ProfilePage",
            name: doc.document.id,
            url: canonical,
            ...(modified ? { dateModified: modified } : {}),
            about: personLd(),
          },
        ],
      };
    }
  }

  // not-found, or a document id that does not resolve.
  return {
    title,
    description: "Page not found.",
    canonical: `${SITE_ORIGIN}${route.path}`,
    ogType: "website",
    index: false,
    jsonLd: [],
  };
}
