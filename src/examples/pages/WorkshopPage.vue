<template>
  <div class="panelx-page panelx-page-workshop">
    <WorkshopExample :datasources="datasources" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import WorkshopExample from '../WorkshopExample.vue'
import type { DataSourceConfig } from '../../types/comm'

const datasources = ref<DataSourceConfig[]>([])

onMounted(async () => {
  try {
    const mod = await import('../../editor/editor_config.json')
    const loaded = mod.default as { datasources?: DataSourceConfig[] }
    if (loaded?.datasources?.length) datasources.value = loaded.datasources
  } catch {
    // ignore
  }
  if (typeof document !== 'undefined') document.title = '工车间数字化大屏'
})
</script>

<style scoped>
.panelx-page {
  width: 100%;
  height: 100vh;
  min-height: 0;
  overflow: hidden;
}
.panelx-page-workshop {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: stretch;
}
</style>
