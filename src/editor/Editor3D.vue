<template>
  <div class="panelx-editor3d">
    <aside class="panelx-editor3d-sidebar">
      <h3>3D 组件</h3>
      <div
        v-for="item in modelTypeList"
        :key="item.id"
        class="panelx-editor3d-model-item"
        :title="`${item.label} (${item.id})`"
      >
        <span class="panelx-editor3d-model-label">{{ item.label }}</span>
        <span v-if="item.category" class="panelx-editor3d-model-category">{{ item.category }}</span>
      </div>
      <h3 class="panelx-editor3d-ops">操作</h3>
      <button type="button" class="panelx-editor3d-btn" @click="exportConfig">
        导出配置
      </button>
    </aside>
    <main class="panelx-editor3d-main">
      <div class="panelx-editor3d-canvas">
        <span class="panelx-editor3d-placeholder">3D 编辑区域（逻辑后续添加）</span>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'
import { modelRegistry } from '../framework'
import type { DashboardConfig, WidgetConfig3D } from '../types/dashboard'

/** 注册的模型类型列表，供 3D 编辑器组件列表展示 */
const modelTypeList = computed(() => modelRegistry.getTypes())

/** 3D 编辑器当前配置：符合 DashboardConfig，widgets3D 符合 WidgetConfig3D 格式 */
const config = reactive<DashboardConfig>({
  design: { width: 1920, height: 1080 },
  widgets2D: [],
  widgets3D: []
})

function exportConfig() {
  const payload: DashboardConfig = {
    design: { ...config.design },
    widgets2D: [],
    widgets3D: config.widgets3D?.length
      ? (config.widgets3D as WidgetConfig3D[]).map((w) => ({
          id: w.id,
          type: w.type,
          worldSize: w.worldSize,
          visible: w.visible,
          props: w.props ? { ...w.props } : undefined
        }))
      : []
  }
  if (config.background != null) payload.background = config.background
  if (config.debug != null) payload.debug = config.debug
  const json = JSON.stringify(payload, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'dashboard-config-3d.json'
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.panelx-editor3d {
  display: flex;
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}
.panelx-editor3d-sidebar {
  flex-shrink: 0;
  width: 12rem;
  padding: 1rem;
  background: #1e293b;
  color: #e2e8f0;
  border-right: 1px solid #334155;
}
.panelx-editor3d-sidebar h3 {
  margin: 0 0 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
}
.panelx-editor3d-model-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.5rem 0.6rem;
  margin-bottom: 0.25rem;
  border-radius: 0.375rem;
  background: #334155;
  color: #e2e8f0;
  font-size: 0.8125rem;
}
.panelx-editor3d-model-item:hover {
  background: #475569;
}
.panelx-editor3d-model-label {
  font-weight: 500;
}
.panelx-editor3d-model-category {
  font-size: 0.6875rem;
  color: #94a3b8;
}
.panelx-editor3d-ops {
  margin-top: 1.5rem;
}
.panelx-editor3d-btn {
  display: block;
  width: 100%;
  padding: 0.5rem 0.75rem;
  margin-top: 0.5rem;
  border: 1px solid #475569;
  border-radius: 0.375rem;
  background: #334155;
  color: #e2e8f0;
  font-size: 0.875rem;
  cursor: pointer;
}
.panelx-editor3d-btn:hover {
  background: #475569;
}
.panelx-editor3d-main {
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0f172a;
}
.panelx-editor3d-canvas {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.panelx-editor3d-placeholder {
  color: #64748b;
  font-size: 0.875rem;
}
</style>
