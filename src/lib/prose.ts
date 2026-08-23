/**
 * Markdown → HTML for document prose.
 *
 * Section `content` in the document JSON is authored as Markdown. It is turned
 * into HTML during the static build, using Astro's own Markdown processor (the
 * same engine that renders `.md` pages), so nothing about this reaches the
 * client: the pages ship plain HTML.
 *
 * The mirror image of src/lib/markdown.ts, which goes the other way — it emits
 * the Markdown twin of each route (`/index.md`, …), where section content is
 * already Markdown and passes through untouched.
 */

import {
  createSatteriMarkdownProcessor,
  type SatteriMarkdownProcessorOptions,
} from "@astrojs/markdown-satteri";
import type { MarkdownRenderer } from "@astrojs/internal-helpers/markdown";

type HastPlugin = NonNullable<
  SatteriMarkdownProcessorOptions["hastPlugins"]
>[number];

/** Links out of the site get the same treatment as the hand-written ones. */
const externalLinks: HastPlugin = {
  name: "l5z12-external-links",
  element: {
    filter: ["a"],
    visit(node, ctx) {
      const href = node.properties?.href;
      if (typeof href === "string" && /^https?:\/\//i.test(href)) {
        ctx.setProperty(node, "target", "_blank");
        ctx.setProperty(node, "rel", "noopener noreferrer external");
      }
    },
  },
};

/**
 * Section titles are `<h2>`, so headings written inside a section body start at
 * `<h3>`: `#` → h3, `##` → h4, … clamped at h6. Keeps the outline valid rather
 * than letting a `#` in prose outrank the document title.
 */
const shiftHeadings: HastPlugin = {
  name: "l5z12-shift-headings",
  element: {
    filter: ["h1", "h2", "h3", "h4", "h5", "h6"],
    visit(node) {
      const level = Number(node.tagName.slice(1));
      return { ...node, tagName: `h${Math.min(level + 2, 6)}` };
    },
  },
};

let processor: Promise<MarkdownRenderer> | null = null;

function getProcessor(): Promise<MarkdownRenderer> {
  // Syntax highlighting is off on purpose: Shiki writes a theme's colours into
  // inline styles, which cannot follow the light/dark toggle here. Code blocks
  // come out as plain <pre><code>, styled from base.css with the site's own
  // two-colour palette.
  processor ??= createSatteriMarkdownProcessor({
    syntaxHighlight: false,
    hastPlugins: [externalLinks, shiftHeadings],
  });
  return processor;
}

// The default document renders twice (`/` and `/document/<id>`), and its
// Markdown does not change between the two.
const cache = new Map<string, string>();

/** Render a Markdown block to HTML. Build-time only. */
export async function renderProse(src: string): Promise<string> {
  const cached = cache.get(src);
  if (cached !== undefined) return cached;

  const renderer = await getProcessor();
  const { code } = await renderer.render(src);
  const html = code.trim();
  cache.set(src, html);
  return html;
}

/**
 * Strip Markdown down to plain text.
 *
 * For the places that must not carry markup: `<meta>` descriptions, JSON-LD,
 * and the summaries on /documents (which sit inside a link, where a nested
 * anchor would be invalid HTML). Kept sync and regex-based because its callers
 * — `pageMeta`, `llmsTxt` — are sync, while the real processor is not.
 */
export function plainText(src: string): string {
  return src
    .replace(/```[\s\S]*?```/g, " ") // fenced code
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1") // images → alt text
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // links → label
    .replace(/`([^`]*)`/g, "$1") // inline code
    .replace(/^\s{0,3}#{1,6}\s+/gm, "") // headings
    .replace(/^\s{0,3}>\s?/gm, "") // blockquotes
    .replace(/^\s{0,3}(?:[-*+]|\d+\.)\s+/gm, "") // list markers
    .replace(/(\*\*|__)(.*?)\1/g, "$2") // bold
    .replace(/(\*|_)(.*?)\1/g, "$2") // italic
    .replace(/~~(.*?)~~/g, "$1") // strikethrough
    .replace(/\s+/g, " ")
    .trim();
}
