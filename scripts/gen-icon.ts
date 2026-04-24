/**
 * Generate favicon.ico (16/32/48 px) and apple-touch-icon.png (180 px)
 * from public/l5z12.jpg.
 *
 * Usage: bun run gen-icon
 */

import sharp from "sharp";
import { writeFileSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname.replace(
  /^\/([A-Za-z]:)/,
  "$1",
);
const SRC = join(ROOT, "public", "l5z12.jpg");
const OUT_ICO = join(ROOT, "public", "favicon.ico");
const OUT_PNG = join(ROOT, "public", "apple-touch-icon.png");

const ICO_SIZES = [16, 32, 48] as const;

// ── ICO builder ────────────────────────────────────────────
// Encodes PNG blobs into a valid .ico container.
function buildIco(pngs: Buffer[], sizes: readonly number[]): Buffer {
  const n = pngs.length;
  const headerSize = 6;
  const dirSize = n * 16;
  let offset = headerSize + dirSize;

  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon (not cursor)
  header.writeUInt16LE(n, 4);

  const dirs = pngs.map((png, i) => {
    const sz = sizes[i]!;
    const dir = Buffer.alloc(16);
    dir[0] = sz >= 256 ? 0 : sz; // width  (0 = 256)
    dir[1] = sz >= 256 ? 0 : sz; // height (0 = 256)
    dir[2] = 0; // color count (0 = truecolor)
    dir[3] = 0; // reserved
    dir.writeUInt16LE(1, 4); // color planes
    dir.writeUInt16LE(32, 6); // bits per pixel
    dir.writeUInt32LE(png.length, 8);
    dir.writeUInt32LE(offset, 12);
    offset += png.length;
    return dir;
  });

  return Buffer.concat([header, ...dirs, ...pngs]);
}

// ── Main ───────────────────────────────────────────────────
async function main() {
  console.log(`Source: ${SRC}`);

  const pngs = await Promise.all(
    ICO_SIZES.map((size) =>
      sharp(SRC)
        .resize(size, size, { fit: "cover", position: "attention" })
        .png({ compressionLevel: 9 })
        .toBuffer(),
    ),
  );

  writeFileSync(OUT_ICO, buildIco(pngs, ICO_SIZES));
  console.log(
    `favicon.ico  → ${ICO_SIZES.join("/")} px  (${pngs.reduce((a, b) => a + b.length, 0)}B)`,
  );

  await sharp(SRC)
    .resize(180, 180, { fit: "cover", position: "attention" })
    .png({ compressionLevel: 9 })
    .toFile(OUT_PNG);

  console.log(`apple-touch-icon.png → 180 px  (${statSync(OUT_PNG).size}B)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
