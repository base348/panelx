<template>
  <div class="stat-container" :class="className">
    <div class="stat-content">
      <div class="stat-value" :class="`text-${color}`">
        <span v-if="prefix" class="stat-prefix">{{ prefix }}</span>
        {{ value }}
        <span v-if="suffix" class="stat-suffix">{{ suffix }}</span>
      </div>
      <div class="stat-label">{{ label }}</div>
    </div>
    <div v-if="trend" class="stat-trend" :class="`trend-${trend}`">
      <span v-if="trend === 'up'">↑</span>
      <span v-else-if="trend === 'down'">↓</span>
      <span v-else>→</span>
      {{ trendValue }}
    </div>
  </div>
</template>

<script setup lang="ts">
import type { StatProps } from '../types/components'

defineProps<StatProps>()
</script>

<style scoped>
.stat-container {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: var(--spacing-medium);
  background-color: white;
  border-radius: var(--border-radius-medium);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: var(--font-size-medium);
  color: var(--color-secondary);
}

.stat-prefix,
.stat-suffix {
  font-size: 1rem;
  margin: 0 0.25rem;
}

.stat-trend {
  font-size: var(--font-size-small);
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.trend-up {
  color: var(--color-success);
}

.trend-down {
  color: var(--color-error);
}

.trend-stable {
  color: var(--color-secondary);
}

.text-primary {
  color: var(--color-primary);
}

.text-secondary {
  color: var(--color-secondary);
}

.text-success {
  color: var(--color-success);
}

.text-warning {
  color: var(--color-warning);
}

.text-error {
  color: var(--color-error);
}

.text-info {
  color: var(--color-info);
}
</style>