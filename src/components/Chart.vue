<template>
  <div 
    ref="chartRef" 
    :style="{ width, height }" 
    :class="className"
  ></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'
import type { ChartProps } from '../types/components'

const props = defineProps<ChartProps>()
const chartRef = ref<HTMLElement | null>(null)
let chartInstance: echarts.ECharts | null = null

const width = props.width || '100%'
const height = props.height || '400px'

onMounted(() => {
  if (chartRef.value) {
    chartInstance = echarts.init(chartRef.value, props.theme)
    chartInstance.setOption(props.options)
  }
})

watch(() => props.options, (newOptions) => {
  if (chartInstance) {
    chartInstance.setOption(newOptions)
  }
}, { deep: true })

watch(() => props.loading, (loading) => {
  if (chartInstance) {
    chartInstance.showLoading(loading ? 'default' : undefined)
  }
})

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
})

/** 数据更新接口：外部喂数据时调用 */
function setOption(option: import('echarts').EChartsOption) {
  if (chartInstance) {
    chartInstance.setOption(option)
  }
}

defineExpose({
  setOption
})
</script>

<style scoped>
.chart-container {
  position: relative;
}
</style>