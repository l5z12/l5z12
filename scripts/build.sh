#!/usr/bin/env bash
# Full build: WASM + type-check + Vite bundle
# Used as the Cloudflare Pages build command: bash scripts/build.sh
set -euo pipefail

# ── Rust ─────────────────────────────────────────────────────────────────────
if ! command -v cargo &>/dev/null; then
  echo "[build] Rust not found — installing via rustup..."
  curl https://sh.rustup.rs -sSf | sh -s -- -y --profile minimal --target wasm32-unknown-unknown
  # shellcheck source=/dev/null
  source "$HOME/.cargo/env"
else
  rustup target add wasm32-unknown-unknown
fi

# ── wasm-opt (binaryen) ──────────────────────────────────────────────────────
# We invoke wasm-opt directly rather than going through wasm-pack — the crate
# does not use wasm-bindgen, so the wasm-pack pipeline would just add weight.
if ! command -v wasm-opt &>/dev/null; then
  echo "[build] wasm-opt not found — downloading binaryen..."
  BINARYEN_VER=version_117
  TMP=$(mktemp -d)
  curl -fsSL "https://github.com/WebAssembly/binaryen/releases/download/${BINARYEN_VER}/binaryen-${BINARYEN_VER}-x86_64-linux.tar.gz" \
    | tar xz -C "$TMP"
  export PATH="$TMP/binaryen-${BINARYEN_VER}/bin:$PATH"
fi

echo "[build] rustc    $(rustc --version)"
echo "[build] wasm-opt $(wasm-opt --version | head -1)"
echo "[build] bun      $(bun --version)"

# ── Build ────────────────────────────────────────────────────────────────────
bun run build:wasm
exec bun run build
