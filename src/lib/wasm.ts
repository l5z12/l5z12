// Hand-rolled loader for the email-reveal WASM.
//
// The Rust crate exposes a single `reveal()` export that returns a packed
// u64 — the low 32 bits are a pointer into linear memory, the high 32 bits
// are the byte length of a UTF-8 encoded email.  Memory is leaked on the
// Rust side because reveal is invoked at most once per page.

import wasmUrl from "../../wasm/pkg/l5z12_wasm_bg.wasm?url";

interface Exports {
  memory: WebAssembly.Memory;
  reveal(): bigint;
}

let cached: Exports | null = null;
let pending: Promise<Exports> | null = null;

async function load(): Promise<Exports> {
  if (cached) return cached;
  if (!pending) {
    pending = WebAssembly.instantiateStreaming(fetch(wasmUrl), {})
      .catch(async () => {
        // Fallback for hosts that don't serve application/wasm.
        const bytes = await fetch(wasmUrl).then((r) => r.arrayBuffer());
        return WebAssembly.instantiate(bytes, {});
      })
      .then((r) => {
        cached = r.instance.exports as unknown as Exports;
        return cached;
      });
  }
  return pending;
}

const decoder = new TextDecoder();

export async function reveal(): Promise<string> {
  const w = await load();
  const packed = w.reveal();
  const ptr = Number(packed & 0xffffffffn);
  const len = Number(packed >> 32n);
  return decoder.decode(new Uint8Array(w.memory.buffer, ptr, len));
}
