<template>
  <div 
    class="grid-container"
    :style="{
      display: 'grid',
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gap: gap
    }"
    :class="className"
  >
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import type { GridProps } from '../types/components'

defineProps<GridProps>()
</script>

<style scoped>
.grid-container {
  width: 100%;
}
</style>