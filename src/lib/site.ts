/**
 * Canonical site identity used to build absolute URLs in SEO / agent-discovery
 * metadata (sitemap, JSON-LD, Open Graph, API catalog, llms.txt).
 *
 * The Worker is served on `l5z12.dev` and `www.l5z12.dev` (see wrangler.jsonc);
 * `l5z12.dev` is treated as canonical.
 */

/** Canonical origin — no trailing slash. */
export const SITE_ORIGIN = "https://l5z12.dev";

/** Human-facing brand / handle. */
export const SITE_NAME = "l5z12";

/** Default social / Open Graph image (absolute URL). */
export const SITE_IMAGE = `${SITE_ORIGIN}/l5z12-192.jpg`;

const MONTHS = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];

/**
 * Normalise a human-readable `updated` value (e.g. "April 2026") to an
 * ISO-8601 date string ("2026-04-01") for use in `<lastmod>` / `dateModified`.
 * Returns null when the value cannot be parsed.
 */
export function updatedToIso(updated: string): string | null {
  const trimmed = updated.trim();

  // Already ISO-ish ("2026-04" or "2026-04-01").
  const iso = trimmed.match(/^(\d{4})-(\d{2})(?:-(\d{2}))?$/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3] ?? "01"}`;

  // "April 2026" → "2026-04-01".
  const monthYear = trimmed.match(/^([A-Za-z]+)\s+(\d{4})$/);
  if (monthYear) {
    const idx = MONTHS.indexOf(monthYear[1]!.toLowerCase());
    if (idx >= 0) {
      return `${monthYear[2]}-${String(idx + 1).padStart(2, "0")}-01`;
    }
  }

  return null;
}
