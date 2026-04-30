<script setup lang="ts">
import { currentRoute } from "@/lib/router";
</script>

<template>
  <header class="doc-header">
    <div class="doc-meta-row">
      <span>{{ currentRoute.path }}</span>
      <span>404</span>
    </div>
  </header>
  <div class="doc-rule-top" />
  <main class="doc-body">
    <h1 class="page-title">Page not found</h1>
    <p>The requested path does not exist.</p>
    <p>
      <a href="/">Home</a> &middot;
      <a href="/documents">Documents</a>
    </p>
  </main>
</template>

<style scoped>
.doc-header {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--fg-muted);
  margin-bottom: 0.5rem;
}

.doc-meta-row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.doc-rule-top {
  border: none;
  border-top: 2px solid var(--fg);
  margin: 0;
}

.doc-body {
  padding: 2rem 0;
}

.page-title {
  font-family: var(--font-mono);
  font-size: 1.5rem;
  margin: 0 0 0.75rem;
}
</style>
