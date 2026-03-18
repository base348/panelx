<template>
  <div class="panelx-editor3d-canvas">
    <div class="panelx-editor3d-world-wrap" :style="worldOuterStyle">
      <div id="panelx-editor3d-world" class="panelx-editor3d-world" />
      <div v-if="!widgets3D.length" class="panelx-editor3d-world-hint">
        拖入左侧模型到此处，放下后填写位置与缩放
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PropType, StyleValue } from 'vue'
import type { WidgetConfig3D } from '../../../types/dashboard'

defineProps({
  worldOuterStyle: { type: Object as PropType<StyleValue>, required: true },
  widgets3D: { type: Array as PropType<WidgetConfig3D[]>, required: true }
})
</script>

