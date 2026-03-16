<template>
  <div class="panelx-example-configurable">
    <DashboardWithLoader />
  </div>
</template>

<script setup lang="ts">
import { DashboardWithLoader } from '../components'
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
