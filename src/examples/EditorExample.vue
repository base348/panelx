<template>
  <div class="panelx-example-editor">
    <Editor2D />
  </div>
</template>

<script setup lang="ts">
import { Editor2D } from '../editor'
import { registerExampleEditor2DWidgets } from './registerExampleEditor2DWidgets'

registerExampleEditor2DWidgets()
</script>

<style scoped>
.panelx-example-editor {
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}
</style>
