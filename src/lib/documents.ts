import type { Document } from "@/types/document";
import { parseMarkdownDocument } from "./markdownDocument";

const modules = import.meta.glob<Document>("../documents/*.json", {
  eager: true,
  import: "default",
});

const markdownModules = import.meta.glob<string>(
  ["../documents/*.md", "!../documents/README.md", "!../documents/_*.md"],
  { eager: true, query: "?raw", import: "default" },
);
const documents = {
  ...modules,
  ...Object.fromEntries(
    Object.entries(markdownModules).map(([path, source]) => [
      path,
      parseMarkdownDocument(source, path),
    ]),
  ),
};

const byId = new Map<string, Document>();
const all: Document[] = [];

for (const [path, doc] of Object.entries(documents)) {
  // Files starting with `_` (e.g. _template.json) are treated as scaffolding
  // and never registered as live documents.
  if (/\/_[^/]+\.json$/.test(path)) continue;

  if (!doc.document?.id) {
    console.warn(`[documents] ${path} is missing document.id — skipped`);
    continue;
  }
  if (byId.has(doc.document.id)) {
    throw new Error(
      `[documents] duplicate id ${doc.document.id} at ${path}; each JSON or Markdown document must have a unique id`,
    );
  }
  byId.set(doc.document.id, doc);
  all.push(doc);
}

all.sort((a, b) => a.document.id.localeCompare(b.document.id));

const DEFAULT_DOCUMENT_ID = "L5Z12-PERSONAL-001";

export function listDocuments(): Document[] {
  return all.filter((d) => !d.document.unlisted);
}

/**
 * Every document, including `unlisted` ones. Used to statically generate a page
 * per document (an unlisted doc is hidden from the index but reachable by URL).
 */
export function allDocuments(): Document[] {
  return all;
}

export function getDocument(id: string): Document | undefined {
  return byId.get(id);
}

export function getDefaultDocument(): Document | undefined {
  return byId.get(DEFAULT_DOCUMENT_ID) ?? all[0];
}
