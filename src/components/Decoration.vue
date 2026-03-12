<template>
  <div class="panelx-decoration" :class="[variant, className]">
    <template v-if="variant === 'corner'">
      <span class="corner corner-tl" />
      <span class="corner corner-tr" />
      <span class="corner corner-bl" />
      <span class="corner corner-br" />
    </template>
    <template v-else-if="variant === 'border'">
      <span class="border-edge edge-t" />
      <span class="border-edge edge-r" />
      <span class="border-edge edge-b" />
      <span class="border-edge edge-l" />
    </template>
  </div>
</template>

<script setup lang="ts">
import type { DecorationProps } from '../types/components'

withDefaults(defineProps<DecorationProps>(), { variant: 'corner' })
</script>

<style scoped>
.panelx-decoration {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.corner {
  position: absolute;
  width: 20px;
  height: 20px;
  border-color: var(--color-primary, #1890ff);
  border-style: solid;
  border-width: 0;
}
.corner-tl {
  top: 0;
  left: 0;
  border-top-width: 2px;
  border-left-width: 2px;
}
.corner-tr {
  top: 0;
  right: 0;
  border-top-width: 2px;
  border-right-width: 2px;
}
.corner-bl {
  bottom: 0;
  left: 0;
  border-bottom-width: 2px;
  border-left-width: 2px;
}
.corner-br {
  bottom: 0;
  right: 0;
  border-bottom-width: 2px;
  border-right-width: 2px;
}
.border-edge {
  position: absolute;
  background: linear-gradient(90deg, transparent, var(--color-primary, #1890ff), transparent);
  opacity: 0.6;
}
.edge-t {
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
}
.edge-b {
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
}
.edge-l {
  left: 0;
  top: 0;
  bottom: 0;
  width: 1px;
  background: linear-gradient(180deg, transparent, var(--color-primary, #1890ff), transparent);
}
.edge-r {
  right: 0;
  top: 0;
  bottom: 0;
  width: 1px;
  background: linear-gradient(180deg, transparent, var(--color-primary, #1890ff), transparent);
}
</style>
