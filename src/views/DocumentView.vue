<script setup lang="ts">
import { computed } from "vue";
import DocumentRenderer from "@/components/DocumentRenderer.vue";
import { getDocument } from "@/lib/documents";

const props = defineProps<{ id: string }>();

const doc = computed(() => getDocument(props.id));
</script>

<template>
  <DocumentRenderer v-if="doc" :doc="doc" />

  <template v-else>
    <header class="doc-header">
      <div class="doc-meta-row">
        <span>{{ id }}</span>
        <span>404</span>
      </div>
    </header>
    <div class="doc-rule-top" />
    <main class="doc-body missing">
      <h1 class="page-title">Document not found</h1>
      <p>
        No document with id <code class="mono">{{ id }}</code> exists.
      </p>
      <p>
        <a href="/documents">Back to index</a>
      </p>
    </main>
  </template>
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

.missing {
  font-family: var(--font-body);
}

.page-title {
  font-family: var(--font-mono);
  font-size: 1.5rem;
  margin: 0 0 0.75rem;
}

.mono {
  font-family: var(--font-mono);
}
</style>
