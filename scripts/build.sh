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
  # Ensure wasm32 target is present
  rustup target add wasm32-unknown-unknown
fi

# ── wasm-pack ────────────────────────────────────────────────────────────────
if ! command -v wasm-pack &>/dev/null; then
  echo "[build] wasm-pack not found — installing..."
  curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
  export PATH="$HOME/.cargo/bin:$PATH"
fi

echo "[build] rustc  $(rustc --version)"
echo "[build] wasm-pack $(wasm-pack --version)"
echo "[build] bun    $(bun --version)"

# ── Build ────────────────────────────────────────────────────────────────────
bun run build:wasm
exec bun run build
