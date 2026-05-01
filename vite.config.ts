import { fileURLToPath, URL } from "node:url";
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { defineConfig, type Plugin, type HmrContext } from "vite";
import vue from "@vitejs/plugin-vue";
import { cloudflare } from "@cloudflare/vite-plugin";

// plugin-vue's handleHotUpdate calls compiler.invalidateTypeCache which
// throws when the worker Vite environment triggers HMR with no Vue compiler.
// Wrap it to suppress the crash.
function safeVue(): Plugin {
  const p = vue() as Plugin;
  const orig = p.handleHotUpdate;
  if (orig) {
    p.handleHotUpdate = async function (this: unknown, ctx: HmrContext) {
      try {
        return await (orig as (ctx: HmrContext) => unknown).call(this, ctx);
      } catch {}
    };
  }
  return p;
}

interface FileEntry {
  sha256: string;
  sri: string;
  size: number;
}

function securityManifest(): Plugin {
  let outDir = "dist";
  let isClient = false;

  return {
    name: "security-manifest",
    apply: "build",
    configResolved(config) {
      outDir = config.build.outDir;
      isClient = config.build.ssr !== true && !outDir.includes("l5z12");
    },
    closeBundle() {
      if (!isClient) return;

      const files: Record<string, FileEntry> = {};

      function scan(dir: string) {
        for (const name of readdirSync(dir)) {
          const full = join(dir, name);
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

      try {
        scan(outDir);
      } catch {
        return;
      }

      const generated = new Date().toISOString();
      const manifest = { generated, files };

      writeFileSync(
        join(outDir, "security.json"),
        JSON.stringify(manifest, null, 2),
      );

      const lines = [
        "# Security manifest — generated at build time",
        `# Generated: ${generated}`,
        "#",
        ...Object.entries(files).map(
          ([p, { sha256, size }]) => `sha256:${sha256}  ${p}  (${size}B)`,
        ),
        "",
      ];
      writeFileSync(join(outDir, "security.txt"), lines.join("\n"));

      console.log(
        `\n[security-manifest] ${Object.keys(files).length} files → ${outDir}`,
      );
    },
  };
}

// @cloudflare/vite-plugin starts miniflare, which uses `ws` events
// (`upgrade`, `unexpected-response`) that Bun's polyfill does not implement.
// Under Bun, miniflare's bootstrap hangs and Vite never binds. Skip the
// plugin during `vite dev` on Bun — the frontend does not fetch /api/*,
// so worker-less dev is safe. Build mode always keeps the plugin so the
// worker bundle is produced. Use wrangler dev (`bun run preview`) when
// you need to exercise /api/* locally.
const isBun = typeof (process as { versions?: { bun?: string } }).versions
  ?.bun === "string";

export default defineConfig(({ command, isSsrBuild }) => {
  // The SSR build produces a server bundle for prerendering; it must not
  // run the Cloudflare plugin (which only makes sense for the client/worker
  // pipeline) or the security manifest (irrelevant for the server bundle).
  const skipWorker = isSsrBuild || (command === "serve" && isBun);
  if (skipWorker && !isSsrBuild) {
    console.log(
      "[vite.config] Bun detected in dev — skipping @cloudflare/vite-plugin. " +
        "Use `bun run preview` (wrangler dev) to test /api/* routes.",
    );
  }
  return {
    plugins: [
      safeVue(),
      ...(skipWorker ? [] : [cloudflare()]),
      ...(isSsrBuild ? [] : [securityManifest()]),
    ],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
  };
});
