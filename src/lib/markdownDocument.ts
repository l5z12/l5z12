import { parse } from "yaml";
import type { Document } from "../types/document";

/** Load owner-authored Markdown without interpreting or splitting its body. */
export function parseMarkdownDocument(source: string, path: string): Document {
  const fail = (message: string): never => {
    throw new Error(`[documents] ${path}: ${message}`);
  };
  const match = source.match(
    /^\uFEFF?---[^\S\r\n]*\r?\n([\s\S]*?)\r?\n---[^\S\r\n]*(?:\r?\n|$)/,
  );
  if (!match) fail("expected YAML frontmatter between --- lines");

  let data: any;
  try {
    data = parse(match![1]!);
  } catch (error) {
    fail(
      `invalid YAML: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
  const record = (value: unknown): value is Record<string, unknown> =>
    value !== null && typeof value === "object" && !Array.isArray(value);
  const text = (value: unknown, field: string) => {
    if (typeof value !== "string" || !value.trim())
      fail(`${field} must be a non-empty string`);
  };
  if (!record(data) || !record(data.identity) || !record(data.document)) {
    fail("frontmatter must contain identity and document mappings");
  }
  for (const field of ["name", "handle"])
    text(data.identity[field], `identity.${field}`);
  for (const field of ["id", "status", "updated"])
    text(data.document[field], `document.${field}`);
  if (!/^[A-Za-z0-9][A-Za-z0-9_-]*$/.test(data.document.id)) {
    fail(
      "document.id must contain only letters, digits, hyphens, or underscores",
    );
  }
  if (
    data.document.summary !== undefined &&
    typeof data.document.summary !== "string"
  ) {
    fail("document.summary must be a string");
  }
  if (
    data.document.unlisted !== undefined &&
    typeof data.document.unlisted !== "boolean"
  ) {
    fail("document.unlisted must be a boolean");
  }
  if (data.sections !== undefined)
    fail("write sections in the Markdown body instead of frontmatter");
  const avatar = data.identity.avatar;
  if (avatar !== undefined) {
    if (!record(avatar)) fail("identity.avatar must be a mapping");
    text(avatar.src, "identity.avatar.src");
    text(avatar.alt, "identity.avatar.alt");
    if (avatar.webp !== undefined) text(avatar.webp, "identity.avatar.webp");
    if (avatar.attribution !== undefined) {
      if (!record(avatar.attribution))
        fail("identity.avatar.attribution must be a mapping");
      text(avatar.attribution.text, "identity.avatar.attribution.text");
      text(avatar.attribution.url, "identity.avatar.attribution.url");
    }
  }
  return {
    identity: data.identity,
    document: data.document,
    sections: [],
    content: source.slice(match![0].length),
  };
}
