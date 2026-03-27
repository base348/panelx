<template>
  <main
    class="panelx-editor3d-main"
    :class="{ 'panelx-editor3d-main-drag-over': isDragOver }"
    :style="{ background: editorBackgroundColor }"
    @dragover.prevent="emit('dragover')"
    @dragleave="emit('dragleave')"
    @drop.prevent="emit('drop', $event)"
  >
    <InstancePanel
      :widgets3D="widgets3D"
      :group-options="groupOptions"
      :selected-widget-id="selectedWidgetId"
      :open="floatingInstanceListOpen"
      :get-widget-display-name="getWidgetDisplayName"
      :format-widget-scale="formatWidgetScale"
      :on-select-widget="onSelectWidget"
      :clone-widget="cloneWidget"
      :delete-widget="deleteWidget"
      :on-create-group="onCreateGroup"
      @update:open="emit('update:floatingInstanceListOpen', $event)"
    />
    <div class="panelx-editor3d-camera-float">
      <div class="panelx-editor3d-camera-float-title">Camera</div>
      <div class="panelx-editor3d-camera-float-row">
        <span class="panelx-editor3d-camera-float-label">position</span>
        <span class="panelx-editor3d-camera-float-value">{{ cameraInfo?.positionText || '-' }}</span>
      </div>
      <div class="panelx-editor3d-camera-float-row">
        <span class="panelx-editor3d-camera-float-label">lookAt</span>
        <span class="panelx-editor3d-camera-float-value">{{ cameraInfo?.lookAtText || '-' }}</span>
      </div>
      <div class="panelx-editor3d-camera-float-row">
        <span class="panelx-editor3d-camera-float-label">zoom</span>
        <span class="panelx-editor3d-camera-float-value">{{ cameraInfo?.zoomText || '-' }}</span>
      </div>
    </div>
    <WorldCanvas :world-outer-style="worldOuterStyle" :widgets3D="widgets3D" />
  </main>
</template>

<script setup lang="ts">
import type { PropType, StyleValue } from 'vue'
import type { WidgetConfig3D } from '../../../types/dashboard'
import InstancePanel from './InstancePanel.vue'
import WorldCanvas from './WorldCanvas.vue'

defineProps({
  isDragOver: { type: Boolean, required: true },
  editorBackgroundColor: { type: String, required: true },
  worldOuterStyle: { type: Object as PropType<StyleValue>, required: true },
  widgets3D: { type: Array as PropType<WidgetConfig3D[]>, required: true },
  groupOptions: { type: Array as PropType<string[]>, required: true },
  // 允许 null（未选中时）
  selectedWidgetId: { type: [String, null] as unknown as PropType<string | null>, required: true },
  floatingInstanceListOpen: { type: Boolean, required: true },
  getWidgetDisplayName: { type: Function as PropType<(w: WidgetConfig3D) => string>, required: true },
  formatWidgetScale: { type: Function as PropType<(s: unknown) => string>, required: true },
  onSelectWidget: { type: Function as PropType<(w: WidgetConfig3D) => void>, required: true },
  cloneWidget: { type: Function as PropType<(w: WidgetConfig3D) => void>, required: true },
  deleteWidget: { type: Function as PropType<(w: WidgetConfig3D) => void>, required: true },
  onCreateGroup: { type: Function as PropType<(name: string) => void>, required: true },
  cameraInfo: {
    type: Object as PropType<{ positionText: string; lookAtText: string; zoomText: string }>,
    required: false,
    default: () => ({
      positionText: '-',
      lookAtText: '-',
      zoomText: '-'
    })
  }
})

const emit = defineEmits<{
  (e: 'dragover'): void
  (e: 'dragleave'): void
  (e: 'drop', ev: DragEvent): void
  (e: 'update:floatingInstanceListOpen', v: boolean): void
}>()
</script>

