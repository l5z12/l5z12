# Documents

Each `.json` or `.md` file in this directory becomes a document on the site
(except this README and files starting with `_`):

| File                      | URL                            |
| ------------------------- | ------------------------------ |
| `L5Z12-PERSONAL-001.json` | `/document/L5Z12-PERSONAL-001` |
| `L5Z12-PERSONAL-002.json` | `/document/L5Z12-PERSONAL-002` |

The index at `/documents` is generated automatically from the files here.
The home page (`/`) renders the document with id `L5Z12-PERSONAL-001`.

## Add a new document

### Markdown files

1. Copy `_template.md` to a new `.md` file in this directory.
2. Set `identity.name` (the page title), `identity.handle`, and a unique
   `document.id` in the YAML frontmatter between the opening `---` lines.
3. Set `document.status`, `document.updated` (a string), and optionally
   `document.summary`. Remove `unlisted: true` when you want it listed publicly.
4. Write Markdown below the frontmatter, then run `bun run build` and deploy.

The URL comes from `document.id`, not the filename. IDs may contain letters,
digits, hyphens, and underscores, and must start with a letter or digit.
Duplicate IDs across JSON and Markdown files stop the build with an error.
Invalid or missing Markdown metadata also stops the build and names the file.

The layout supplies the page's `<h1>` from `identity.name`; start body sections
with `##`. Headings in a full `.md` body keep their original level. Lists,
tables, fenced code, links, and other supported Markdown render at build time.
The body is processed as one document so reference links and footnotes can be
used across sections. Write section content in the body, not in frontmatter.
Use site-root paths for local links and images, such as `/documents` or
`/image.png` for an image stored in `public/image.png`.

The optional `identity.avatar` fields work just like the JSON format below.
Summaries fall back to the Markdown body when `document.summary` is omitted;
an explicit short summary is recommended for long documents.
The body also appears in the page's `.md` download without its YAML metadata.
Markdown is trusted owner-authored content, like the existing JSON prose.

### JSON files

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
