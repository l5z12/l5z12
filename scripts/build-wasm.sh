#!/usr/bin/env bash
# Build the email-reveal WASM crate and run wasm-opt for size.
#
# Output: wasm/pkg/l5z12_wasm_bg.wasm
#
# Requires: cargo (rustup target wasm32-unknown-unknown), wasm-opt (binaryen).
set -euo pipefail

cd "$(dirname "$0")/.."

CRATE_DIR=wasm
RAW=$CRATE_DIR/target/wasm32-unknown-unknown/release/l5z12_wasm.wasm
OUT_DIR=$CRATE_DIR/pkg
OUT=$OUT_DIR/l5z12_wasm_bg.wasm

mkdir -p "$OUT_DIR"

(cd "$CRATE_DIR" && cargo build --release --target wasm32-unknown-unknown)

wasm-opt -Oz \
  --enable-bulk-memory \
  --strip-debug \
  --strip-producers \
  "$RAW" -o "$OUT"

printf '[build-wasm] %s  (%s B)\n' "$OUT" "$(wc -c < "$OUT")"
