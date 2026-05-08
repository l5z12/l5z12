<script setup lang="ts">
import { currentRoute } from "@/lib/router";
import { notFoundConfig as cfg } from "@/lib/notFound";
</script>

<template>
  <header class="doc-header">
    <div class="doc-meta-row">
      <span class="doc-id">{{ currentRoute.path }}</span>
      <span class="doc-status">{{ cfg.code }}</span>
    </div>
    <div class="doc-meta-row">
      <span>l5z12</span>
      <span>{{ cfg.status }}</span>
    </div>
  </header>

  <div class="doc-rule-top" />

  <main class="doc-body">
    <h1 class="page-title">{{ cfg.title }}</h1>
    <p class="page-lede">{{ cfg.message }}</p>

    <ul v-if="cfg.links.length" class="link-list">
      <li v-for="link in cfg.links" :key="link.url">
        <a :href="link.url" class="mono">&lt;{{ link.label }}&gt;</a>
        <span class="link-path mono">{{ link.url }}</span>
      </li>
    </ul>
  </main>
</template>

<style scoped>
.page-lede {
  margin: 0 0 2rem;
  color: var(--fg-muted);
  line-height: 1.7;
}

.link-list {
  list-style: none;
  margin: 0;
  padding: 0;
  border-top: 1px solid var(--border);
}

.link-list li {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: baseline;
  padding: 0.6rem 0;
  border-bottom: 1px solid var(--border);
  font-size: 0.9rem;
}

.link-path {
  color: var(--fg-muted);
  font-size: 0.8rem;
}
</style>
