# Documents

Each `.json` file in this directory becomes a document on the site:

| File                      | URL                            |
| ------------------------- | ------------------------------ |
| `L5Z12-PERSONAL-001.json` | `/document/L5Z12-PERSONAL-001` |
| `L5Z12-PERSONAL-002.json` | `/document/L5Z12-PERSONAL-002` |

The index at `/documents` is generated automatically from the files here.
The home page (`/`) renders the document with id `L5Z12-PERSONAL-001`.

## Add a new document

1. Copy `_template.json` (or any existing document) to a new file.
2. Pick a unique `document.id` — convention is `L5Z12-<CATEGORY>-<NNN>`.
3. Edit the JSON. Save.
4. Rebuild (`bun run build`) and deploy. The new document appears at
   `/document/<id>` and on the `/documents` index.

No application code needs to change. Files are auto-discovered at build
time via Vite's `import.meta.glob`.

## Schema

See `src/types/document.ts` for the full type. Minimal example:

```json
{
  "identity": {
    "name": "l5z12",
    "handle": "l5z12"
  },
  "document": {
    "id": "L5Z12-EXAMPLE-001",
    "status": "Draft",
    "updated": "May 2026",
    "summary": "One-line summary shown on the /documents index."
  },
  "sections": [
    {
      "id": "abstract",
      "number": null,
      "title": "Abstract",
      "content": "Free-form prose, written in Markdown."
    },
    {
      "id": "details",
      "number": 1,
      "title": "Details",
      "content": "Optional intro paragraph.",
      "items": [
        { "label": "Key", "value": "Value" },
        {
          "label": "Link",
          "value": "example.com",
          "url": "https://example.com",
          "mono": true
        }
      ]
    }
  ]
}
```

## Markdown

`sections[].content` is Markdown (CommonMark plus GitHub extensions: tables,
footnotes, strikethrough, task lists). It is rendered to HTML at build time by
`src/lib/prose.ts`, so pages still ship as plain static HTML — no Markdown
parser reaches the browser.

````json
{
  "id": "notes",
  "number": 1,
  "title": "Notes",
  "content": "A paragraph with a [link](https://example.com), `inline code` and **bold**.

- a list item
- another

```js
const x = 1;
```"
}
````

Notes on how it renders here:

- Headings are shifted down two levels — `#` becomes `<h3>`, `##` becomes
  `<h4>` — because the section title above the body is already an `<h2>`.
- Links to other origins get `target="_blank"` and
  `rel="noopener noreferrer external"` automatically; site-relative links are
  left alone.
- Code blocks are not syntax-highlighted, by design: the highlighter writes a
  fixed theme's colours into inline styles, which cannot follow the site's
  light/dark toggle. They render as plain `<pre><code>` styled from
  `base.css`.
- `document.summary` may contain Markdown too, but everywhere it is used — the
  `/documents` index, `<meta>` descriptions, JSON-LD, `llms.txt` — it is
  stripped to a single line of plain text.
- The Markdown twin of each page (`/document/<id>.md`) passes section
  content through unchanged; it was Markdown to begin with.

## Field notes

- `document.id` — must be unique; becomes the URL slug.
- `document.summary` — optional; falls back to the abstract section on the index.
- `document.unlisted` — set to `true` to hide from `/documents` (still reachable by URL).
- `identity.avatar` — optional; the avatar block is omitted if absent.
- `sections[].number` — integer for numbered sections, or `null` for unnumbered (e.g. abstract).
- `sections[].content` — Markdown; see above.
- `sections[].items[].type` — `"email"` triggers the WASM email-reveal flow; otherwise `"link"`/`"text"`.
