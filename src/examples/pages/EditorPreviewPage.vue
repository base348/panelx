<template>
  <div class="panelx-page panelx-page-preview" :style="{ background: previewConfig?.background ?? '#0a1628' }">
    <div class="panelx-page-preview-wrap panelx-dashboard-wrap">
      <Dashboard v-if="previewConfig" :config="previewConfig" :datasources="datasources" />
      <div v-else class="panelx-page-preview-empty">
        未发现预览数据，请从编辑器点击“预览”进入。
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Dashboard } from '../../components'
import type { DashboardConfig } from '../../types/dashboard'
import type { DataSourceConfig } from '../../types/comm'

const PREVIEW_STORAGE_KEY = 'PanelX_EDITOR_PREVIEW_CONFIG'

const previewConfig = ref<DashboardConfig | null>(null)
const datasources = ref<DataSourceConfig[]>([])

onMounted(async () => {
  try {
    const raw = localStorage.getItem(PREVIEW_STORAGE_KEY)
    if (raw) previewConfig.value = JSON.parse(raw) as DashboardConfig
  } catch {
    previewConfig.value = null
  }

  try {
    const mod = await import('../../editor/editor_config.json')
    const loaded = mod.default as { datasources?: DataSourceConfig[] }
    if (loaded?.datasources?.length) datasources.value = loaded.datasources
  } catch {
    // ignore
  }

  if (typeof document !== 'undefined') document.title = '编辑器预览'
})
</script>

<style scoped>
.panelx-page {
  width: 100%;
  height: 100vh;
  min-height: 0;
  overflow: hidden;
}
.panelx-page-preview {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: stretch;
}
.panelx-page-preview-wrap {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  min-height: 0;
  flex: 1;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  overflow: hidden;
}
.panelx-page-preview-empty {
  margin-top: 2rem;
  color: rgba(255, 255, 255, 0.72);
  font-size: 14px;
}
</style>

