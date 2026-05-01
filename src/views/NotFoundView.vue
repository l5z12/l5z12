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
    <h1 class="page-title small">Page not found</h1>
    <p>The requested path does not exist.</p>
    <p>
      <a href="/">Home</a> &middot;
      <a href="/documents">Documents</a>
    </p>
  </main>
</template>
