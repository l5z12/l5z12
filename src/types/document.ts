export interface AvatarConfig {
  /** JPEG/PNG fallback path. Required. */
  src: string;
  /** Optional WebP path used as the preferred source. */
  webp?: string;
  alt: string;
  attribution: { text: string; url: string };
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
  content?: string;
  items?: SectionItem[];
}

export interface DocumentMeta {
  id: string;
  status: string;
  updated: string;
  /** Optional listing-page summary. Falls back to abstract section if absent. */
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
