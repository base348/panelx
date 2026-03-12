<template>
  <div class="panel-container" :class="className">
    <div v-if="title || description" class="panel-header mb-4">
      <h2 v-if="title" class="panel-title">{{ title }}</h2>
      <p v-if="description" class="panel-description">{{ description }}</p>
    </div>
    <div class="panel-body">
      <div v-if="loading" class="panelx-loading">
        Loading...
      </div>
      <div v-else-if="error" class="panelx-error">
        {{ error }}
      </div>
      <div v-else>
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PanelProps } from '../types/components'

defineProps<PanelProps>()
</script>

<style scoped>
.panel-container {
  width: 100%;
  background-color: white;
  border-radius: var(--border-radius-medium);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: var(--spacing-medium);
  margin-bottom: var(--spacing-medium);
}

.panel-header {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.panel-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text);
}

.panel-description {
  font-size: var(--font-size-medium);
  color: var(--color-secondary);
}

.panel-body {
  flex: 1;
}
</style>