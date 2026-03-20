<template>
  <div class="panelx-example-configurable">
    <DashboardWithLoader :load-from="loadFrom" storage-key="PanelX_EDITOR_PREVIEW_CONFIG" />
  </div>
</template>

<script setup lang="ts">
import { DashboardWithLoader } from '../components'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const loadFrom = computed(() => ((route.query.source as string | undefined) === 'local' ? 'localStorage' : 'file'))
</script>

<style scoped>
.panelx-example-configurable {
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}
.panelx-example-configurable :deep(.panelx-dashboard-with-loader) {
  width: 100%;
  height: 100%;
}
</style>
