<script setup lang="ts">
import { computed } from "vue";
import DocumentRenderer from "@/components/DocumentRenderer.vue";
import { getDefaultDocument } from "@/lib/documents";

const doc = computed(() => getDefaultDocument());
</script>

<template>
  <DocumentRenderer v-if="doc" :doc="doc" />
  <p v-else class="empty">No documents available.</p>
</template>

<style scoped>
.empty {
  padding: 2rem 0;
  color: var(--fg-muted);
  font-family: var(--font-mono);
}
</style>
