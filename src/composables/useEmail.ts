import { ref } from "vue";

type State = "idle" | "loading" | "ready" | "error";

const state = ref<State>("idle");
const email = ref<string>("");

export function useEmail() {
  async function load() {
    if (state.value !== "idle") return;
    state.value = "loading";
    try {
      const { reveal } = await import("@/lib/wasm");
      email.value = await reveal();
      state.value = "ready";
    } catch {
      state.value = "error";
    }
  }

  return { email, state, load };
}
