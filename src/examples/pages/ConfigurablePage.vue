<template>
  <div class="panelx-page">
    <ConfigurableExample />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import ConfigurableExample from '../ConfigurableExample.vue'

onMounted(() => {
  if (typeof document !== 'undefined') document.title = '配置加载大屏'
})
</script>

<style scoped>
.panelx-page {
  width: 100%;
  height: 100vh;
  min-height: 0;
  overflow: hidden;
}
</style>
