<script setup lang="ts">
import { ref, computed, onMounted, watch, watchEffect } from "vue";
import HomeView from "@/views/HomeView.vue";
import DocumentsView from "@/views/DocumentsView.vue";
import DocumentView from "@/views/DocumentView.vue";
import NotFoundView from "@/views/NotFoundView.vue";
import { currentRoute, installRouter } from "@/lib/router";
import { getDocument, getDefaultDocument } from "@/lib/documents";

const SITE_TITLE = "l5z12";

const pageTitle = computed<string>(() => {
  const route = currentRoute.value;
  if (route.name === "home") {
    const doc = getDefaultDocument();
    return doc ? `${doc.document.id} | ${SITE_TITLE}` : SITE_TITLE;
  }
  if (route.name === "documents") return `Documents | ${SITE_TITLE}`;
  if (route.name === "document") {
    const id = route.params.id ?? "";
    const doc = getDocument(id);
    return doc
      ? `${doc.document.id} | ${SITE_TITLE}`
      : `Not found | ${SITE_TITLE}`;
  }
  return `Not found | ${SITE_TITLE}`;
});

watchEffect(() => {
  document.title = pageTitle.value;
});

type Theme = "auto" | "light" | "dark";
const THEME_KEY = "l5z12-theme";

const theme = ref<Theme>("auto");
const themeLabel = computed<string>(
  () => ({ auto: "Auto", light: "Light", dark: "Dark" })[theme.value],
);

function applyTheme(t: Theme) {
  if (t === "auto") {
    document.documentElement.removeAttribute("data-theme");
  } else {
    document.documentElement.setAttribute("data-theme", t);
  }
  try {
    localStorage.setItem(THEME_KEY, t);
  } catch {}
}

function cycleTheme() {
  const next: Record<Theme, Theme> = {
    auto: "light",
    light: "dark",
    dark: "auto",
  };
  theme.value = next[theme.value];
}

onMounted(() => {
  installRouter();
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "auto" || saved === "light" || saved === "dark")
      theme.value = saved;
  } catch {}
  applyTheme(theme.value);
});

watch(theme, applyTheme);

const copyrightName = "l5z12";
</script>

<template>
  <div class="page">
    <div class="view-slot">
      <HomeView v-if="currentRoute.name === 'home'" />
      <DocumentsView v-else-if="currentRoute.name === 'documents'" />
      <DocumentView
        v-else-if="currentRoute.name === 'document'"
        :id="currentRoute.params.id!"
        :key="currentRoute.params.id"
      />
      <NotFoundView v-else />
    </div>

    <div class="doc-rule-bottom" />

    <footer class="doc-footer">
      <span>&copy;&nbsp;{{ copyrightName }}</span>
      <span class="footer-sep">|</span>
      <a href="/" class="footer-link">Home</a>
      <span class="footer-sep">|</span>
      <a href="/documents" class="footer-link">Documents</a>
      <span class="footer-sep">|</span>
      <button
        class="theme-btn"
        @click="cycleTheme"
        :title="`Theme: ${themeLabel} — click to cycle`"
      >
        {{ themeLabel }}
      </button>
    </footer>
  </div>
</template>

<style scoped>
.page {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 2rem 1.5rem;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.view-slot {
  flex: 1;
}

.doc-rule-bottom {
  border: none;
  border-top: 2px solid var(--fg);
  margin: 0;
}

.doc-footer {
  padding-top: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: var(--fg-muted);
  font-family: var(--font-mono);
}

.footer-sep {
  color: var(--border);
}

.footer-link {
  color: var(--fg-muted);
  font-family: var(--font-mono);
  font-size: 0.8rem;
}

.footer-link:hover {
  color: var(--fg);
}

.theme-btn {
  background: none;
  border: 1px solid var(--border);
  color: var(--fg-muted);
  font-family: var(--font-mono);
  font-size: 0.75rem;
  padding: 0.1rem 0.4rem;
  cursor: pointer;
  border-radius: 2px;
  transition:
    border-color 0.15s,
    color 0.15s;
}

.theme-btn:hover {
  border-color: var(--fg);
  color: var(--fg);
}
</style>
