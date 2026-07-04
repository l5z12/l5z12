import { fileURLToPath, URL } from "node:url";
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { defineConfig } from "astro/config";

/**
 * Build-time SRI / integrity manifest.
 *
 * Ported from the old Vite `securityManifest` plugin: after Astro writes the
 * static output, hash every emitted file and record sha256 + SRI + size into
 * `security.json` (machine-readable) and `security.txt` (human-readable).
 */
function securityManifest() {
  return {
    name: "security-manifest",
    hooks: {
      "astro:build:done": ({ dir, logger }) => {
        const outDir = fileURLToPath(dir);
        const files = {};

        function scan(d) {
          for (const name of readdirSync(d)) {
            const full = join(d, name);
            if (statSync(full).isDirectory()) {
              scan(full);
            } else {
              const buf = readFileSync(full);
              const sha256 = createHash("sha256").update(buf).digest("hex");
              const sri =
                "sha256-" + createHash("sha256").update(buf).digest("base64");
              const path = "/" + relative(outDir, full).replace(/\\/g, "/");
              files[path] = { sha256, sri, size: buf.length };
            }
          }
        }

        scan(outDir);

        // Emit synchronously into the just-scanned tree. The two manifest
        // files reference themselves only by absence — they are written after
        // the scan so they do not hash themselves.
        const generated = new Date().toISOString();
        writeFileSync(
          join(outDir, "security.json"),
          JSON.stringify({ generated, files }, null, 2),
        );
        writeFileSync(
          join(outDir, "security.txt"),
          [
            "# Security manifest — generated at build time",
            `# Generated: ${generated}`,
            "#",
            ...Object.entries(files).map(
              ([p, { sha256, size }]) => `sha256:${sha256}  ${p}  (${size}B)`,
            ),
            "",
          ].join("\n"),
        );

        logger.info(`${Object.keys(files).length} files hashed → security.json`);
      },
    },
  };
}

// https://astro.build/config
export default defineConfig({
  site: "https://l5z12.dev",
  // Directory-style URLs: `/documents` → dist/documents/index.html, matching the
  // previous prerender layout and the Markdown-twin paths.
  build: { format: "directory" },
  // Nothing here needs client JS: keep the two tiny inline theme scripts inline
  // and let the one email-reveal island stay a hoisted module.
  integrations: [securityManifest()],
  vite: {
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
  },
});
