<template>
  <div class="panelx-page panelx-page-workshop">
    <WorkshopExample :datasources="datasources" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import WorkshopExample from '../WorkshopExample.vue'
import type { BackendDataSourceConfig } from '../../types'
import { loadDatasourceConfigFromStorage } from '../../utils/datasourceConfigStorage'

const datasources = ref<BackendDataSourceConfig[]>([])

onMounted(async () => {
  datasources.value = loadDatasourceConfigFromStorage()
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
