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
      <h1 class="page-title small">Document not found</h1>
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
.missing {
  font-family: var(--font-body);
}
</style>
