import { test } from "node:test";
import assert from "node:assert/strict";
import { parseMarkdownDocument } from "../src/lib/markdownDocument";
import { renderProse } from "../src/lib/prose";

const metadata = `---
identity:
  name: Example
  handle: owner
document:
  id: EXAMPLE-001
  status: Draft
  updated: 2026-09-23
  unlisted: false
---
`;
const body = `
## Overview

**Bold** and [a reference][target].

## Details

| Key | Value |
| --- | --- |
| One | Two |

~~~md
## This is code
---
~~~

[target]: https://example.com
`;

test("Markdown metadata is parsed and the complete body is preserved", () => {
  const doc = parseMarkdownDocument(metadata + body, "example.md");
  assert.equal(doc.document.id, "EXAMPLE-001");
  assert.equal(doc.document.updated, "2026-09-23");
  assert.equal(doc.document.unlisted, false);
  assert.equal(doc.identity.name, "Example");
  assert.equal(doc.content, body);
  assert.deepEqual(doc.sections, []);
});

test("Windows line endings and a BOM are supported", () => {
  const doc = parseMarkdownDocument(
    "\uFEFF" + (metadata + body).replace(/\n/g, "\r\n"),
    "windows.md",
  );
  assert.equal(doc.content, body.replace(/\n/g, "\r\n"));
});

test("invalid author metadata reports the source file", () => {
  for (const source of [
    body,
    "---\nidentity: [\n---\n",
    metadata.replace("name: Example", "name: null"),
    metadata.replace("EXAMPLE-001", "../bad"),
    metadata.replace("unlisted: false", 'unlisted: "false"'),
    metadata.replace("  status: Draft", "  status: Draft\n  status: Published"),
  ]) {
    assert.throws(
      () => parseMarkdownDocument(source, "broken.md"),
      /\[documents\] broken\.md:/,
    );
  }
});

test("full Markdown bodies render tables and cross-section references", async () => {
  const html = await renderProse(body, 0);
  assert.match(html, /<h2[^>]*>Overview<\/h2>/);
  assert.match(html, /<strong>Bold<\/strong>/);
  assert.match(html, /<table>/);
  assert.match(html, /href="https:\/\/example.com"/);
  assert.match(html, /<pre[^>]*><code/);
  // Different heading modes must not share cached output.
  assert.match(await renderProse("## Heading", 0), /<h2/);
  assert.match(await renderProse("## Heading"), /<h4/);
});
