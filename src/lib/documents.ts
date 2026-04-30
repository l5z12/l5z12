import type { Document } from "@/types/document";

const modules = import.meta.glob<Document>("../documents/*.json", {
  eager: true,
  import: "default",
});

const byId = new Map<string, Document>();
const all: Document[] = [];

for (const [path, doc] of Object.entries(modules)) {
  // Files starting with `_` (e.g. _template.json) are treated as scaffolding
  // and never registered as live documents.
  if (/\/_[^/]+\.json$/.test(path)) continue;

  if (!doc.document?.id) {
    console.warn(`[documents] ${path} is missing document.id — skipped`);
    continue;
  }
  if (byId.has(doc.document.id)) {
    console.warn(`[documents] duplicate id ${doc.document.id} at ${path}`);
    continue;
  }
  byId.set(doc.document.id, doc);
  all.push(doc);
}

all.sort((a, b) => a.document.id.localeCompare(b.document.id));

export const DEFAULT_DOCUMENT_ID = "L5Z12-PERSONAL-001";

export function listDocuments(): Document[] {
  return all.filter((d) => !d.document.unlisted);
}

export function allDocuments(): Document[] {
  return all;
}

export function getDocument(id: string): Document | undefined {
  return byId.get(id);
}

export function getDefaultDocument(): Document | undefined {
  return byId.get(DEFAULT_DOCUMENT_ID) ?? all[0];
}
