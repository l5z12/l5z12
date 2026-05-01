import "./assets/main.css";
import { createSSRApp, createApp } from "vue";
import App from "./App.vue";
import { setPath } from "./lib/router";

setPath(window.location.pathname);

const root = document.getElementById("app");
const ssrPainted = !!root?.firstElementChild;

// If the server has already painted markup, hydrate it; otherwise mount
// fresh.  Hydration is required for routes with pre-rendered HTML; the
// fresh-mount path is the safety net for unknown routes that fall through
// to the SPA shell (Cloudflare's not_found_handling).
if (ssrPainted) {
  createSSRApp(App).mount("#app");
} else {
  createApp(App).mount("#app");
}
