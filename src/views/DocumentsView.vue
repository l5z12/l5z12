<script setup lang="ts">
import { computed } from "vue";
import { listDocuments } from "@/lib/documents";

const docs = computed(() => listDocuments());

function summaryFor(doc: ReturnType<typeof listDocuments>[number]): string {
  if (doc.document.summary) return doc.document.summary;
  const abstract = doc.sections.find((s) => s.id === "abstract");
  return abstract?.content ?? "";
}
</script>

<template>
  <header class="doc-header">
    <div class="doc-meta-row">
      <span class="doc-id">L5Z12-INDEX</span>
      <span class="doc-status">Index</span>
    </div>
    <div class="doc-meta-row">
      <span>l5z12</span>
      <span>{{ docs.length }} document{{ docs.length === 1 ? "" : "s" }}</span>
    </div>
  </header>

  <div class="doc-rule-top" />

  <main class="doc-body">
    <section class="title-block">
      <h1 class="page-title">Documents</h1>
      <p class="page-lede">
        Index of public documents. Select an entry to read the full text.
      </p>
    </section>

    <ul v-if="docs.length" class="doc-list">
      <li v-for="doc in docs" :key="doc.document.id" class="doc-list-item">
        <a :href="`/document/${doc.document.id}`" class="doc-link">
          <div class="doc-line">
            <span class="doc-list-id">{{ doc.document.id }}</span>
            <span class="doc-list-status">{{ doc.document.status }}</span>
          </div>
          <p v-if="summaryFor(doc)" class="doc-list-summary">
            {{ summaryFor(doc) }}
          </p>
          <div class="doc-list-meta">
            Updated:&nbsp;{{ doc.document.updated }}
          </div>
        </a>
      </li>
    </ul>

    <p v-else class="empty">No documents available.</p>
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

.title-block {
  margin-bottom: 2rem;
}

.page-title {
  font-family: var(--font-mono);
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin: 0 0 0.5rem;
  color: var(--fg);
}

.page-lede {
  margin: 0;
  color: var(--fg-muted);
  line-height: 1.7;
}

.doc-list {
  list-style: none;
  margin: 0;
  padding: 0;
  border-top: 1px solid var(--border);
}

.doc-list-item {
  border-bottom: 1px solid var(--border);
}

.doc-link {
  display: block;
  padding: 1rem 0;
  color: inherit;
}

.doc-link:hover {
  text-decoration: none;
}

.doc-link:hover .doc-list-id {
  color: var(--link);
}

.doc-line {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: baseline;
  font-family: var(--font-mono);
}

.doc-list-id {
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--fg);
  transition: color 0.15s;
}

.doc-list-status {
  font-size: 0.75rem;
  color: var(--fg-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.doc-list-summary {
  margin: 0.4rem 0 0.5rem;
  line-height: 1.6;
  font-size: 0.95rem;
}

.doc-list-meta {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--fg-muted);
}

.empty {
  padding: 2rem 0;
  color: var(--fg-muted);
  font-family: var(--font-mono);
}
</style>
