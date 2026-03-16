<template>
  <div class="panelx-example-editor3d">
    <Editor3D :preset-models="modelPresets" />
  </div>
</template>

<script setup lang="ts">
import { Editor3D } from '../editor'
import { modelPresets } from './modelPresets'
</script>

<style scoped>
.panelx-example-editor3d {
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}
</style>
