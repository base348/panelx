<template>
  <div 
    class="grid-item"
    :style="{
      gridColumn: span ? `span ${span}` : 'span 1'
    }"
    :class="className"
  >
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import type { GridItemProps } from '../types/components'

defineProps<GridItemProps>()
</script>

<style scoped>
.grid-item {
  display: flex;
  flex-direction: column;
}
</style>