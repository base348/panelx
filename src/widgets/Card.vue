<template>
  <div 
    class="panelx-card"
    :class="{
      'border': bordered,
      'shadow-lg': shadow
    }"
    :style="{
      padding: padding
    }"
  >
    <div v-if="title || subtitle" class="card-header mb-4">
      <h3 v-if="title" class="panelx-title">{{ title }}</h3>
      <p v-if="subtitle" class="panelx-subtitle">{{ subtitle }}</p>
    </div>
    <div class="card-body">
      <slot></slot>
    </div>
    <div v-if="footer" class="card-footer mt-4 pt-4 border-t border-gray-200">
      {{ footer }}
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CardProps } from '../types/components'

defineProps<CardProps>()
</script>

<style scoped>
.card-header {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.card-body {
  flex: 1;
}

.card-footer {
  text-align: right;
  color: var(--color-secondary);
  font-size: var(--font-size-small);
}

.border {
  border: 1px solid var(--color-border);
}

.shadow-lg {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
</style>