/// <reference types="vite/client" />

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<object, object, unknown>;
  export default component;
}

declare module "@wasm" {
  import type { InitInput, InitOutput } from "../wasm/pkg/l5z12_wasm.d.ts";
  export function reveal(): string;
  export default function init(
    module_or_path?:
      | { module_or_path: InitInput | Promise<InitInput> }
      | InitInput
      | Promise<InitInput>,
  ): Promise<InitOutput>;
}
