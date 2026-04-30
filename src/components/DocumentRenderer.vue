<script setup lang="ts">
import type { Document } from "@/types/document";
import { useEmail } from "@/composables/useEmail";

defineProps<{ doc: Document }>();

const { email, state: emailState, load: loadEmail } = useEmail();
</script>

<template>
  <header class="doc-header">
    <div class="doc-meta-row">
      <span class="doc-id">{{ doc.document.id }}</span>
      <span class="doc-status">{{ doc.document.status }}</span>
    </div>
    <div class="doc-meta-row">
      <span class="doc-author">{{ doc.identity.handle }}</span>
      <span class="doc-updated">Updated:&nbsp;{{ doc.document.updated }}</span>
    </div>
  </header>

  <div class="doc-rule-top" />

  <div class="doc-body">
    <section class="title-section">
      <div v-if="doc.identity.avatar" class="avatar-block">
        <img
          :src="doc.identity.avatar.src"
          :alt="doc.identity.avatar.alt"
          class="avatar"
        />
        <p class="avatar-credit">
          Art:&nbsp;<a
            :href="doc.identity.avatar.attribution.url"
            target="_blank"
            rel="noopener noreferrer external"
            >{{ doc.identity.avatar.attribution.text }}</a
          >
        </p>
      </div>
      <h1 class="identity-name">{{ doc.identity.name }}</h1>
    </section>

    <template v-for="section in doc.sections" :key="section.id">
      <section :id="section.id" class="doc-section">
        <h2 class="section-heading">
          <span v-if="section.number !== null" class="section-num"
            >{{ section.number }}.&nbsp;</span
          >{{ section.title }}
        </h2>
        <hr class="section-hr" />

        <p v-if="section.content" class="section-body">
          {{ section.content }}
        </p>

        <dl v-if="section.items?.length" class="item-list">
          <div v-for="item in section.items" :key="item.label" class="item-row">
            <dt class="item-label">{{ item.label }}</dt>
            <dd class="item-value">
              <template v-if="item.type === 'email'">
                <button
                  v-if="emailState === 'idle'"
                  class="reveal-btn"
                  @click="loadEmail"
                >
                  Show email
                </button>
                <span
                  v-else-if="emailState === 'loading'"
                  class="item-muted mono"
                  >calculating…</span
                >
                <span v-else-if="emailState === 'error'" class="item-muted mono"
                  >unavailable</span
                >
                <a
                  v-else-if="emailState === 'ready'"
                  :href="`mailto:${email}`"
                  class="mono"
                  >&lt;{{ email }}&gt;</a
                >
              </template>
              <a
                v-else-if="item.url"
                :href="item.url"
                :rel="item.rel"
                :class="{ mono: item.mono }"
                target="_blank"
                >&lt;{{ item.value }}&gt;</a
              >
              <span v-else :class="{ mono: item.mono }">{{ item.value }}</span>
            </dd>
          </div>
        </dl>
      </section>
    </template>
  </div>
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

.title-section {
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

.avatar-block {
  flex-shrink: 0;
  text-align: center;
}

.avatar {
  display: block;
  width: 96px;
  height: 96px;
  object-fit: cover;
  border: 1px solid var(--border);
}

.avatar-credit {
  font-size: 0.65rem;
  color: var(--fg-muted);
  margin: 0.35rem 0 0;
  font-family: var(--font-mono);
  white-space: nowrap;
}

.avatar-credit a {
  color: inherit;
}

.identity-name {
  font-family: var(--font-mono);
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin: 0;
  line-height: 1;
  align-self: center;
  color: var(--fg);
}

.doc-section {
  margin-bottom: 2rem;
}

.section-heading {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.section-num {
  color: var(--fg-muted);
}

.section-hr {
  border: none;
  border-top: 1px solid var(--border);
  margin: 0 0 1rem;
}

.section-body {
  margin: 0 0 0.75rem;
  line-height: 1.7;
}

.item-list {
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 0.25rem 1.5rem;
}

.item-row {
  display: contents;
}

.item-label {
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--fg-muted);
  white-space: nowrap;
  align-self: center;
}

.item-value {
  margin: 0;
}

.item-value a,
.item-value span {
  font-size: 0.9rem;
}

.item-muted {
  color: var(--fg-muted);
  font-style: italic;
}

.reveal-btn {
  background: none;
  border: 1px solid var(--border);
  color: var(--link);
  font-family: var(--font-mono);
  font-size: 0.8rem;
  padding: 0.1rem 0.5rem;
  cursor: pointer;
  border-radius: 2px;
  transition:
    border-color 0.15s,
    color 0.15s;
}

.reveal-btn:hover {
  border-color: var(--link);
}

.mono {
  font-family: var(--font-mono);
}
</style>
