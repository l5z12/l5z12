export interface AvatarConfig {
  /** JPEG/PNG fallback path. Required. */
  src: string;
  /** Optional WebP path used as the preferred source. */
  webp?: string;
  alt: string;
  /** Art credit, shown as an "Art:" line under the avatar. Omit for a
   * self-authored image (e.g. a project logo) that needs no attribution. */
  attribution?: { text: string; url: string };
}

export interface SectionItem {
  label: string;
  value: string;
  url?: string;
  rel?: string;
  mono?: boolean;
  type?: "link" | "email" | "text";
}

export interface Section {
  id: string;
  number: number | null;
  title: string;
  /**
   * Section body, authored as Markdown (CommonMark + GFM). Rendered to HTML at
   * build time by src/lib/prose.ts and passed through verbatim into the
   * Markdown twin of the page.
   */
  content?: string;
  items?: SectionItem[];
}

export interface DocumentMeta {
  id: string;
  status: string;
  updated: string;
  /**
   * Optional listing-page summary. Falls back to abstract section if absent.
   * Markdown is allowed but stripped to plain text wherever it is used — the
   * index, `<meta>` descriptions and JSON-LD.
   */
  summary?: string;
  /** Hide from /documents index but keep reachable by direct URL. */
  unlisted?: boolean;
}

export interface DocumentIdentity {
  name: string;
  handle: string;
  avatar?: AvatarConfig;
}

export interface Document {
  identity: DocumentIdentity;
  document: DocumentMeta;
  sections: Section[];
}
